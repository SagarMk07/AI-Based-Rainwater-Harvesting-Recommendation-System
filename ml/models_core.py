"""Pure NumPy-powered ML Algorithms for Classification, Cross-Validation, and Feature Importance.

Optimized for high-throughput vectorized execution in security-restricted environments.
Implements:
1. Multinomial Logistic Regression (Softmax with L2 regularization)
2. Random Forest Classifier (Bagging with Gini impurity & feature subspacing)
3. Gradient Boosting Classifier (Multi-class tree boosting on multinomial deviance)
4. Stratified K-Fold Cross-Validation & Metric Calculators
"""

import math
from typing import List, Tuple, Optional, Dict, Any
import numpy as np


# =====================================================================
# 1. METRICS & CROSS-VALIDATION
# =====================================================================
def calc_confusion_matrix(y_true: np.ndarray, y_pred: np.ndarray, n_classes: int) -> np.ndarray:
    """Compute n_classes x n_classes confusion matrix."""
    cm = np.zeros((n_classes, n_classes), dtype=np.int64)
    for yt, yp in zip(y_true, y_pred):
        cm[int(yt), int(yp)] += 1
    return cm


def evaluate_classification(y_true: np.ndarray, y_pred: np.ndarray, n_classes: int = 4) -> Dict[str, Any]:
    """Compute Accuracy, Macro Precision, Macro Recall, Macro F1, and per-class breakdown."""
    cm = calc_confusion_matrix(y_true, y_pred, n_classes)
    total_samples = len(y_true)
    accuracy = float(np.trace(cm) / total_samples) if total_samples > 0 else 0.0

    precisions = []
    recalls = []
    f1s = []
    per_class = {}

    for c in range(n_classes):
        tp = float(cm[c, c])
        fp = float(np.sum(cm[:, c]) - tp)
        fn = float(np.sum(cm[c, :]) - tp)

        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2.0 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0

        precisions.append(prec)
        recalls.append(rec)
        f1s.append(f1)
        per_class[c] = {
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "support": int(np.sum(cm[c, :])),
        }

    macro_prec = float(np.mean(precisions))
    macro_rec = float(np.mean(recalls))
    macro_f1 = float(np.mean(f1s))

    return {
        "accuracy": round(accuracy, 4),
        "macro_precision": round(macro_prec, 4),
        "macro_recall": round(macro_rec, 4),
        "macro_f1": round(macro_f1, 4),
        "confusion_matrix": cm.tolist(),
        "per_class": per_class,
    }


class StratifiedKFold:
    """Stratified K-Fold cross-validator generating train/val index splits."""
    def __init__(self, n_splits: int = 5, shuffle: bool = True, random_state: int = 42):
        self.n_splits = n_splits
        self.shuffle = shuffle
        self.random_state = random_state

    def split(self, X: np.ndarray, y: np.ndarray):
        np.random.seed(self.random_state)
        n_samples = len(y)
        unique_classes = np.unique(y)

        class_indices = {c: np.where(y == c)[0] for c in unique_classes}
        if self.shuffle:
            for c in class_indices:
                np.random.shuffle(class_indices[c])

        folds = [[] for _ in range(self.n_splits)]
        for c, idxs in class_indices.items():
            for i, idx in enumerate(idxs):
                folds[i % self.n_splits].append(idx)

        all_indices = np.arange(n_samples)
        for fold_idx in range(self.n_splits):
            val_idx = np.array(folds[fold_idx], dtype=np.int64)
            train_mask = np.ones(n_samples, dtype=bool)
            train_mask[val_idx] = False
            train_idx = all_indices[train_mask]
            yield train_idx, val_idx


# =====================================================================
# 2. MODEL 1: MULTINOMIAL LOGISTIC REGRESSION (SOFTMAX)
# =====================================================================
class MultinomialLogisticRegression:
    """Softmax Multi-Class Classifier with L2 Regularization."""
    def __init__(self, learning_rate: float = 0.1, n_epochs: int = 150, l2_reg: float = 1e-4, random_state: int = 42):
        self.lr = learning_rate
        self.n_epochs = n_epochs
        self.l2_reg = l2_reg
        self.random_state = random_state
        self.weights = None
        self.bias = None
        self.n_classes = 4

    def _softmax(self, z: np.ndarray) -> np.ndarray:
        exp_z = np.exp(z - np.max(z, axis=1, keepdims=True))
        return exp_z / np.sum(exp_z, axis=1, keepdims=True)

    def fit(self, X: np.ndarray, y: np.ndarray) -> "MultinomialLogisticRegression":
        np.random.seed(self.random_state)
        N, D = X.shape
        self.n_classes = int(np.max(y) + 1)
        self.weights = np.random.normal(0, 0.01, (D, self.n_classes))
        self.bias = np.zeros(self.n_classes)

        Y_one_hot = np.zeros((N, self.n_classes))
        Y_one_hot[np.arange(N), y] = 1.0

        for epoch in range(self.n_epochs):
            scores = np.dot(X, self.weights) + self.bias
            probs = self._softmax(scores)

            error = probs - Y_one_hot
            grad_w = (np.dot(X.T, error) / N) + (self.l2_reg * self.weights)
            grad_b = np.mean(error, axis=0)

            self.weights -= self.lr * grad_w
            self.bias -= self.lr * grad_b

        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        scores = np.dot(X, self.weights) + self.bias
        return self._softmax(scores)

    def predict(self, X: np.ndarray) -> np.ndarray:
        probs = self.predict_proba(X)
        return np.argmax(probs, axis=1)


# =====================================================================
# 3. MODEL 2: RANDOM FOREST CLASSIFIER (FAST BINNED CART)
# =====================================================================
class DecisionTreeNode:
    def __init__(
        self,
        feature: Optional[int] = None,
        threshold: Optional[float] = None,
        left: Optional["DecisionTreeNode"] = None,
        right: Optional["DecisionTreeNode"] = None,
        probs: Optional[np.ndarray] = None,
        value: Optional[int] = None,
    ):
        self.feature = feature
        self.threshold = threshold
        self.left = left
        self.right = right
        self.probs = probs
        self.value = value

    @property
    def is_leaf(self) -> bool:
        return self.value is not None


class FastDecisionTree:
    """Fast CART Decision Tree with Gini Impurity and class probability distributions."""
    def __init__(self, max_depth: int = 8, min_samples_split: int = 10, max_features: Optional[int] = None, n_classes: int = 4):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.max_features = max_features
        self.n_classes = n_classes
        self.root: Optional[DecisionTreeNode] = None

    def fit(self, X: np.ndarray, y: np.ndarray) -> "FastDecisionTree":
        self.root = self._build(X, y, depth=0)
        return self

    def _gini(self, counts: np.ndarray, total: int) -> float:
        if total == 0:
            return 0.0
        p = counts / total
        return float(1.0 - np.sum(p ** 2))

    def _build(self, X: np.ndarray, y: np.ndarray, depth: int) -> DecisionTreeNode:
        n_samples, n_features = X.shape
        counts = np.bincount(y, minlength=self.n_classes)
        leaf_probs = counts / n_samples if n_samples > 0 else np.ones(self.n_classes) / self.n_classes
        most_common = int(np.argmax(counts))

        if depth >= self.max_depth or n_samples < self.min_samples_split or len(np.unique(y)) == 1:
            return DecisionTreeNode(probs=leaf_probs, value=most_common)

        feat_idxs = np.arange(n_features)
        if self.max_features and self.max_features < n_features:
            feat_idxs = np.random.choice(n_features, self.max_features, replace=False)

        best_gain = -1.0
        split_feat, split_thresh = None, None
        current_gini = self._gini(counts, n_samples)

        # Sample for threshold evaluation if large
        eval_X = X if n_samples <= 400 else X[np.random.choice(n_samples, 400, replace=False)]

        for feat in feat_idxs:
            col_vals = eval_X[:, feat]
            min_v, max_v = np.min(col_vals), np.max(col_vals)
            if max_v - min_v < 1e-5:
                continue

            thresholds = np.linspace(min_v + 0.1 * (max_v - min_v), max_v - 0.1 * (max_v - min_v), 6)

            for thresh in thresholds:
                left_mask = X[:, feat] <= thresh
                n_left = int(np.sum(left_mask))
                n_right = n_samples - n_left
                if n_left < 4 or n_right < 4:
                    continue

                left_counts = np.bincount(y[left_mask], minlength=self.n_classes)
                right_counts = counts - left_counts

                gain = current_gini - (
                    (n_left / n_samples) * self._gini(left_counts, n_left) +
                    (n_right / n_samples) * self._gini(right_counts, n_right)
                )

                if gain > best_gain:
                    best_gain = gain
                    split_feat = int(feat)
                    split_thresh = float(thresh)

        if split_feat is None or best_gain <= 1e-6:
            return DecisionTreeNode(probs=leaf_probs, value=most_common)

        left_mask = X[:, split_feat] <= split_thresh
        left = self._build(X[left_mask], y[left_mask], depth + 1)
        right = self._build(X[~left_mask], y[~left_mask], depth + 1)
        return DecisionTreeNode(feature=split_feat, threshold=split_thresh, left=left, right=right)

    def _traverse(self, x: np.ndarray, node: Optional[DecisionTreeNode]) -> np.ndarray:
        if node is None or node.is_leaf:
            return node.probs if node else np.ones(self.n_classes) / self.n_classes
        if x[node.feature] <= node.threshold:
            return self._traverse(x, node.left)
        return self._traverse(x, node.right)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        return np.array([self._traverse(x, self.root) for x in X])


class RandomForestClassifier:
    """Random Forest Classifier with Bootstrap Aggregating and Feature Importance."""
    def __init__(self, n_estimators: int = 25, max_depth: int = 8, min_samples_split: int = 10, random_state: int = 42):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.random_state = random_state
        self.trees: List[FastDecisionTree] = []
        self.n_classes: int = 4
        self.feature_importances_: Optional[np.ndarray] = None

    def fit(self, X: np.ndarray, y: np.ndarray) -> "RandomForestClassifier":
        np.random.seed(self.random_state)
        n_samples, n_features = X.shape
        self.n_classes = int(np.max(y) + 1)
        max_feats = max(2, int(np.sqrt(n_features)))

        self.trees = []
        split_counts = np.zeros(n_features)

        for _ in range(self.n_estimators):
            boot_idxs = np.random.choice(n_samples, min(n_samples, 2000), replace=True)
            X_b, y_b = X[boot_idxs], y[boot_idxs]

            tree = FastDecisionTree(
                max_depth=self.max_depth,
                min_samples_split=self.min_samples_split,
                max_features=max_feats,
                n_classes=self.n_classes,
            )
            tree.fit(X_b, y_b)
            self.trees.append(tree)

        for tree in self.trees:
            self._accumulate_splits(tree.root, split_counts)

        total_splits = np.sum(split_counts)
        self.feature_importances_ = (split_counts / total_splits) if total_splits > 0 else np.ones(n_features) / n_features
        return self

    def _accumulate_splits(self, node: Optional[DecisionTreeNode], counts: np.ndarray):
        if node is None or node.is_leaf:
            return
        if node.feature is not None:
            counts[node.feature] += 1
        self._accumulate_splits(node.left, counts)
        self._accumulate_splits(node.right, counts)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        all_tree_probs = np.array([tree.predict_proba(X) for tree in self.trees])
        return np.mean(all_tree_probs, axis=0)

    def predict(self, X: np.ndarray) -> np.ndarray:
        probs = self.predict_proba(X)
        return np.argmax(probs, axis=1)


# =====================================================================
# 4. MODEL 3: GRADIENT BOOSTING CLASSIFIER
# =====================================================================
class RegressionTreeNode:
    def __init__(
        self,
        feature: Optional[int] = None,
        threshold: Optional[float] = None,
        left: Optional["RegressionTreeNode"] = None,
        right: Optional["RegressionTreeNode"] = None,
        value: Optional[float] = None,
    ):
        self.feature = feature
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value

    @property
    def is_leaf(self) -> bool:
        return self.value is not None


class FastRegressionTree:
    """Shallow CART Regression Tree for Gradient Boosting residuals."""
    def __init__(self, max_depth: int = 3, min_samples_split: int = 12):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.root: Optional[RegressionTreeNode] = None

    def fit(self, X: np.ndarray, residuals: np.ndarray) -> "FastRegressionTree":
        self.root = self._build(X, residuals, depth=0)
        return self

    def _build(self, X: np.ndarray, r: np.ndarray, depth: int) -> RegressionTreeNode:
        n_samples, n_features = X.shape
        mean_val = float(np.mean(r)) if n_samples > 0 else 0.0

        if depth >= self.max_depth or n_samples < self.min_samples_split or np.var(r) < 1e-6:
            return RegressionTreeNode(value=mean_val)

        best_red = -1.0
        split_feat, split_thresh = None, None
        curr_var = np.var(r) * n_samples

        eval_X = X if n_samples <= 350 else X[np.random.choice(n_samples, 350, replace=False)]
        feat_idxs = np.random.choice(n_features, min(n_features, 8), replace=False)

        for feat in feat_idxs:
            col_vals = eval_X[:, feat]
            min_v, max_v = np.min(col_vals), np.max(col_vals)
            if max_v - min_v < 1e-5:
                continue

            thresholds = np.linspace(min_v + 0.15 * (max_v - min_v), max_v - 0.15 * (max_v - min_v), 5)

            for thresh in thresholds:
                left_mask = X[:, feat] <= thresh
                n_left = int(np.sum(left_mask))
                n_right = n_samples - n_left
                if n_left < 4 or n_right < 4:
                    continue

                red = curr_var - (np.var(r[left_mask]) * n_left + np.var(r[~left_mask]) * n_right)
                if red > best_red:
                    best_red = red
                    split_feat = int(feat)
                    split_thresh = float(thresh)

        if split_feat is None or best_red <= 1e-6:
            return RegressionTreeNode(value=mean_val)

        left_mask = X[:, split_feat] <= split_thresh
        left = self._build(X[left_mask], r[left_mask], depth + 1)
        right = self._build(X[~left_mask], r[~left_mask], depth + 1)
        return RegressionTreeNode(feature=split_feat, threshold=split_thresh, left=left, right=right)

    def predict(self, X: np.ndarray) -> np.ndarray:
        return np.array([self._traverse(x, self.root) for x in X])

    def _traverse(self, x: np.ndarray, node: Optional[RegressionTreeNode]) -> float:
        if node is None or node.is_leaf:
            return node.value if node else 0.0
        if x[node.feature] <= node.threshold:
            return self._traverse(x, node.left)
        return self._traverse(x, node.right)


class GradientBoostingClassifier:
    """Multi-Class Gradient Boosting via Multinomial Deviance."""
    def __init__(self, n_estimators: int = 15, learning_rate: float = 0.15, max_depth: int = 3, random_state: int = 42):
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.max_depth = max_depth
        self.random_state = random_state
        self.trees: Dict[int, List[FastRegressionTree]] = {}
        self.base_scores: Optional[np.ndarray] = None
        self.n_classes: int = 4
        self.feature_importances_: Optional[np.ndarray] = None

    def _softmax(self, raw_scores: np.ndarray) -> np.ndarray:
        exp_z = np.exp(raw_scores - np.max(raw_scores, axis=1, keepdims=True))
        return exp_z / np.sum(exp_z, axis=1, keepdims=True)

    def fit(self, X: np.ndarray, y: np.ndarray) -> "GradientBoostingClassifier":
        np.random.seed(self.random_state)
        N, D = X.shape
        self.n_classes = int(np.max(y) + 1)
        self.trees = {c: [] for c in range(self.n_classes)}

        class_counts = np.bincount(y, minlength=self.n_classes)
        priors = (class_counts + 1) / (N + self.n_classes)
        self.base_scores = np.log(priors)

        raw_scores = np.tile(self.base_scores, (N, 1))
        Y_one_hot = np.zeros((N, self.n_classes))
        Y_one_hot[np.arange(N), y] = 1.0

        split_counts = np.zeros(D)

        for _ in range(self.n_estimators):
            probs = self._softmax(raw_scores)
            residuals = Y_one_hot - probs

            for c in range(self.n_classes):
                res_c = residuals[:, c]
                tree = FastRegressionTree(max_depth=self.max_depth, min_samples_split=8)
                tree.fit(X, res_c)
                preds = tree.predict(X)

                raw_scores[:, c] += self.learning_rate * preds
                self.trees[c].append(tree)
                self._accumulate_splits(tree.root, split_counts)

        total = np.sum(split_counts)
        self.feature_importances_ = (split_counts / total) if total > 0 else np.ones(D) / D
        return self

    def _accumulate_splits(self, node: Optional[RegressionTreeNode], counts: np.ndarray):
        if node is None or node.is_leaf:
            return
        if node.feature is not None:
            counts[node.feature] += 1
        self._accumulate_splits(node.left, counts)
        self._accumulate_splits(node.right, counts)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        N = len(X)
        raw_scores = np.tile(self.base_scores, (N, 1))
        for c in range(self.n_classes):
            for tree in self.trees[c]:
                raw_scores[:, c] += self.learning_rate * tree.predict(X)
        return self._softmax(raw_scores)

    def predict(self, X: np.ndarray) -> np.ndarray:
        probs = self.predict_proba(X)
        return np.argmax(probs, axis=1)
