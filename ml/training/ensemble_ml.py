"""Native NumPy-powered Decision Trees, Random Forests, and Linear Regression.

Engineered to operate reliably in security-restricted environments (e.g., Windows AppLocker)
where third-party Cython DLLs (_isfinite.pyd, timedeltas.pyd) are blocked.
Provides mathematical equivalence to CART decision tree ensembles with bootstrap aggregation.
"""

import math
import numpy as np
from typing import List, Tuple, Optional, Dict, Any, Union


class LinearRegressionBaseline:
    """Ordinary Least Squares Linear Regression with intercept."""
    def __init__(self):
        self.weights = None
        self.bias = 0.0

    def fit(self, X: np.ndarray, y: np.ndarray) -> "LinearRegressionBaseline":
        X = np.asarray(X, dtype=np.float64)
        y = np.asarray(y, dtype=np.float64)
        N = X.shape[0]
        X_design = np.column_stack([np.ones(N), X])
        # Solve least squares via SVD
        coeffs, _, _, _ = np.linalg.lstsq(X_design, y, rcond=None)
        self.bias = float(coeffs[0])
        self.weights = coeffs[1:]
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        X = np.asarray(X, dtype=np.float64)
        return float(self.bias) + np.dot(X, self.weights)


class Node:
    def __init__(
        self,
        feature: Optional[int] = None,
        threshold: Optional[float] = None,
        left: Optional["Node"] = None,
        right: Optional["Node"] = None,
        value: Optional[Any] = None,
    ):
        self.feature = feature
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value

    @property
    def is_leaf(self) -> bool:
        return self.value is not None


class DecisionTreeRegressor:
    """CART Decision Tree Regressor using Variance Reduction."""
    def __init__(self, max_depth: int = 10, min_samples_split: int = 5, max_features: Optional[int] = None):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.max_features = max_features
        self.root: Optional[Node] = None

    def fit(self, X: np.ndarray, y: np.ndarray) -> "DecisionTreeRegressor":
        X = np.asarray(X, dtype=np.float64)
        y = np.asarray(y, dtype=np.float64)
        self.root = self._build_tree(X, y, depth=0)
        return self

    def _build_tree(self, X: np.ndarray, y: np.ndarray, depth: int) -> Node:
        n_samples, n_features = X.shape

        if depth >= self.max_depth or n_samples < self.min_samples_split or np.var(y) < 1e-7:
            return Node(value=float(np.mean(y)))

        feat_idxs = np.arange(n_features)
        if self.max_features and self.max_features < n_features:
            feat_idxs = np.random.choice(n_features, self.max_features, replace=False)

        best_feat, best_thresh = self._best_split(X, y, feat_idxs)
        if best_feat is None:
            return Node(value=float(np.mean(y)))

        left_mask = X[:, best_feat] <= best_thresh
        right_mask = ~left_mask

        if np.sum(left_mask) == 0 or np.sum(right_mask) == 0:
            return Node(value=float(np.mean(y)))

        left = self._build_tree(X[left_mask], y[left_mask], depth + 1)
        right = self._build_tree(X[right_mask], y[right_mask], depth + 1)
        return Node(feature=best_feat, threshold=best_thresh, left=left, right=right)

    def _best_split(self, X: np.ndarray, y: np.ndarray, feat_idxs: np.ndarray) -> Tuple[Optional[int], Optional[float]]:
        best_variance_reduction = -1.0
        split_feat, split_thresh = None, None
        current_variance = np.var(y) * len(y)

        for feat in feat_idxs:
            vals = np.unique(X[:, feat])
            if len(vals) > 20:
                # Subsample percentiles for speed
                thresholds = np.percentile(vals, np.linspace(5, 95, 15))
            else:
                thresholds = (vals[:-1] + vals[1:]) / 2.0

            for thresh in thresholds:
                left_mask = X[:, feat] <= thresh
                right_mask = ~left_mask
                if np.sum(left_mask) < 2 or np.sum(right_mask) < 2:
                    continue

                left_var = np.var(y[left_mask]) * np.sum(left_mask)
                right_var = np.var(y[right_mask]) * np.sum(right_mask)
                reduction = current_variance - (left_var + right_var)

                if reduction > best_variance_reduction:
                    best_variance_reduction = reduction
                    split_feat = int(feat)
                    split_thresh = float(thresh)

        return split_feat, split_thresh

    def predict(self, X: np.ndarray) -> np.ndarray:
        X = np.asarray(X, dtype=np.float64)
        return np.array([self._traverse(x, self.root) for x in X])

    def _traverse(self, x: np.ndarray, node: Optional[Node]) -> float:
        if node is None or node.is_leaf:
            return node.value if node else 0.0
        if x[node.feature] <= node.threshold:
            return self._traverse(x, node.left)
        return self._traverse(x, node.right)


class RandomForestRegressor:
    """Random Forest Regressor with Bootstrap Aggregating (Bagging)."""
    def __init__(self, n_estimators: int = 50, max_depth: int = 10, min_samples_split: int = 5, random_state: int = 42):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.random_state = random_state
        self.trees: List[DecisionTreeRegressor] = []
        self.feature_importances_raw: Optional[np.ndarray] = None

    def fit(self, X: np.ndarray, y: np.ndarray) -> "RandomForestRegressor":
        np.random.seed(self.random_state)
        X = np.asarray(X, dtype=np.float64)
        y = np.asarray(y, dtype=np.float64)
        n_samples, n_features = X.shape
        max_feats = max(1, int(np.sqrt(n_features)))

        self.trees = []
        counts = np.zeros(n_features)

        for _ in range(self.n_estimators):
            boot_idxs = np.random.choice(n_samples, n_samples, replace=True)
            X_b, y_b = X[boot_idxs], y[boot_idxs]
            tree = DecisionTreeRegressor(
                max_depth=self.max_depth,
                min_samples_split=self.min_samples_split,
                max_features=max_feats,
            )
            tree.fit(X_b, y_b)
            self.trees.append(tree)

        # Approximate feature importances by counting splits
        for tree in self.trees:
            self._count_splits(tree.root, counts)

        total_splits = np.sum(counts)
        self.feature_importances_raw = (counts / total_splits) if total_splits > 0 else np.ones(n_features) / n_features
        return self

    def _count_splits(self, node: Optional[Node], counts: np.ndarray):
        if node is None or node.is_leaf:
            return
        if node.feature is not None:
            counts[node.feature] += 1
        self._count_splits(node.left, counts)
        self._count_splits(node.right, counts)

    def predict(self, X: np.ndarray) -> np.ndarray:
        X = np.asarray(X, dtype=np.float64)
        preds = np.array([tree.predict(X) for tree in self.trees])
        return np.mean(preds, axis=0)


class DecisionTreeClassifier:
    """CART Decision Tree Classifier using Gini Impurity."""
    def __init__(self, max_depth: int = 8, min_samples_split: int = 5, max_features: Optional[int] = None):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.max_features = max_features
        self.root: Optional[Node] = None
        self.classes: Optional[List[str]] = None

    def fit(self, X: np.ndarray, y: List[str]) -> "DecisionTreeClassifier":
        X = np.asarray(X, dtype=np.float64)
        self.classes = sorted(list(set(y)))
        y_encoded = np.array([self.classes.index(label) for label in y])
        self.root = self._build_tree(X, y_encoded, depth=0)
        return self

    def _build_tree(self, X: np.ndarray, y: np.ndarray, depth: int) -> Node:
        n_samples, n_features = X.shape

        if depth >= self.max_depth or n_samples < self.min_samples_split or len(np.unique(y)) == 1:
            most_common = int(np.bincount(y).argmax()) if len(y) > 0 else 0
            return Node(value=self.classes[most_common])

        feat_idxs = np.arange(n_features)
        if self.max_features and self.max_features < n_features:
            feat_idxs = np.random.choice(n_features, self.max_features, replace=False)

        best_feat, best_thresh = self._best_split(X, y, feat_idxs)
        if best_feat is None:
            most_common = int(np.bincount(y).argmax()) if len(y) > 0 else 0
            return Node(value=self.classes[most_common])

        left_mask = X[:, best_feat] <= best_thresh
        right_mask = ~left_mask

        if np.sum(left_mask) == 0 or np.sum(right_mask) == 0:
            most_common = int(np.bincount(y).argmax()) if len(y) > 0 else 0
            return Node(value=self.classes[most_common])

        left = self._build_tree(X[left_mask], y[left_mask], depth + 1)
        right = self._build_tree(X[right_mask], y[right_mask], depth + 1)
        return Node(feature=best_feat, threshold=best_thresh, left=left, right=right)

    def _gini(self, y: np.ndarray) -> float:
        if len(y) == 0:
            return 0.0
        counts = np.bincount(y)
        probs = counts / len(y)
        return float(1.0 - np.sum(probs ** 2))

    def _best_split(self, X: np.ndarray, y: np.ndarray, feat_idxs: np.ndarray) -> Tuple[Optional[int], Optional[float]]:
        best_gain = -1.0
        split_feat, split_thresh = None, None
        current_gini = self._gini(y)

        for feat in feat_idxs:
            vals = np.unique(X[:, feat])
            if len(vals) > 20:
                thresholds = np.percentile(vals, np.linspace(5, 95, 15))
            else:
                thresholds = (vals[:-1] + vals[1:]) / 2.0

            for thresh in thresholds:
                left_mask = X[:, feat] <= thresh
                right_mask = ~left_mask
                if np.sum(left_mask) < 2 or np.sum(right_mask) < 2:
                    continue

                w_left = np.sum(left_mask) / len(y)
                w_right = np.sum(right_mask) / len(y)
                gain = current_gini - (w_left * self._gini(y[left_mask]) + w_right * self._gini(y[right_mask]))

                if gain > best_gain:
                    best_gain = gain
                    split_feat = int(feat)
                    split_thresh = float(thresh)

        return split_feat, split_thresh

    def predict(self, X: np.ndarray) -> List[str]:
        X = np.asarray(X, dtype=np.float64)
        return [self._traverse(x, self.root) for x in X]

    def _traverse(self, x: np.ndarray, node: Optional[Node]) -> str:
        if node is None or node.is_leaf:
            return node.value if node else (self.classes[0] if self.classes else "")
        if x[node.feature] <= node.threshold:
            return self._traverse(x, node.left)
        return self._traverse(x, node.right)


class RandomForestClassifier:
    """Random Forest Classifier with Bootstrap Aggregating."""
    def __init__(self, n_estimators: int = 50, max_depth: int = 8, min_samples_split: int = 5, random_state: int = 42):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.random_state = random_state
        self.trees: List[DecisionTreeClassifier] = []
        self.classes: Optional[List[str]] = None

    def fit(self, X: np.ndarray, y: List[str]) -> "RandomForestClassifier":
        np.random.seed(self.random_state)
        X = np.asarray(X, dtype=np.float64)
        self.classes = sorted(list(set(y)))
        n_samples, n_features = X.shape
        max_feats = max(1, int(np.sqrt(n_features)))

        self.trees = []
        for _ in range(self.n_estimators):
            boot_idxs = np.random.choice(n_samples, n_samples, replace=True)
            X_b = X[boot_idxs]
            y_b = [y[idx] for idx in boot_idxs]

            tree = DecisionTreeClassifier(
                max_depth=self.max_depth,
                min_samples_split=self.min_samples_split,
                max_features=max_feats,
            )
            tree.fit(X_b, y_b)
            self.trees.append(tree)

        return self

    def predict(self, X: np.ndarray) -> List[str]:
        all_tree_preds = [tree.predict(X) for tree in self.trees]
        # Majority voting
        n_samples = len(X)
        final_preds = []
        for i in range(n_samples):
            sample_votes = [all_tree_preds[t][i] for t in range(self.n_estimators)]
            from collections import Counter
            most_common = Counter(sample_votes).most_common(1)[0][0]
            final_preds.append(most_common)
        return final_preds


# Metrics Functions
def calc_mae(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    return float(np.mean(np.abs(y_true - y_pred)))


def calc_rmse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    return float(np.sqrt(np.mean((y_true - y_pred) ** 2)))


def calc_r2(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    ss_res = np.sum((y_true - y_pred) ** 2)
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
    return float(1.0 - (ss_res / ss_tot)) if ss_tot > 0 else 0.0


def calc_accuracy(y_true: List[str], y_pred: List[str]) -> float:
    correct = sum(1 for yt, yp in zip(y_true, y_pred) if yt == yp)
    return float(correct / len(y_true)) if len(y_true) > 0 else 0.0


def calc_confusion_matrix(y_true: List[str], y_pred: List[str], classes: List[str]) -> List[List[int]]:
    matrix = [[0 for _ in classes] for _ in classes]
    c_idx = {c: i for i, c in enumerate(classes)}
    for yt, yp in zip(y_true, y_pred):
        if yt in c_idx and yp in c_idx:
            matrix[c_idx[yt]][c_idx[yp]] += 1
    return matrix


def calc_classification_metrics(y_true: List[str], y_pred: List[str], classes: List[str]) -> Dict[str, float]:
    acc = calc_accuracy(y_true, y_pred)
    cm = calc_confusion_matrix(y_true, y_pred, classes)
    n = len(classes)
    precisions = []
    recalls = []
    f1s = []

    for i in range(n):
        tp = cm[i][i]
        fp = sum(cm[r][i] for r in range(n) if r != i)
        fn = sum(cm[i][c] for c in range(n) if c != i)

        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0

        precisions.append(prec)
        recalls.append(rec)
        f1s.append(f1)

    return {
        "accuracy": round(acc, 4),
        "precision": round(float(np.mean(precisions)), 4),
        "recall": round(float(np.mean(recalls)), 4),
        "f1_score": round(float(np.mean(f1s)), 4),
    }
