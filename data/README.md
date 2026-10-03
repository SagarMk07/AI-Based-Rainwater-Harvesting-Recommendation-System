# RainHarvest AI — Data Architecture & Dataset Documentation

This directory houses the training, reference, and processed datasets utilized by the **RainHarvest AI** hydrological intelligence engine.

---

## 1. Directory Structure

```
data/
├── README.md                           # Comprehensive dataset documentation
├── raw/                                # Raw historical datasets and IMD normals
│   └── imd_normals_reference.json      # 30-year climatological normals for reference stations
└── processed/                          # Preprocessed and engineered datasets
    ├── rainfall_climate_dataset.csv    # 20-year monthly meteorological time-series (15 zones)
    └── recommendations_dataset.csv     # Multi-criteria property & system recommendation dataset (5,400 samples)
```

---

## 2. Dataset Specifications

### A. System Recommendation Dataset (`recommendations_dataset.csv`)

- **Purpose**: Training multi-class classification models to recommend the optimal rainwater harvesting architecture (`Storage Tank`, `Recharge Pit`, `Recharge Well`, `Hybrid System`).
- **Nature of Data**: Synthetic dataset generated using deterministic civil engineering principles (IS 15797:2008, CPWD, CGWB guidelines).
- **Sample Size**: 5,400 records.
- **Random Seed**: 42 (100% deterministic reproducibility).

#### Variables & Schema:

| Field Name | Type | Unit | Description | Range / Categories |
| :--- | :--- | :--- | :--- | :--- |
| `annual_rainfall_mm` | Float | mm/year | Annual precipitation at property location | 250 – 3,200 mm |
| `roof_area_m2` | Float | m² | Rooftop catchment plan area | 20 – 2,200 m² |
| `roof_type` | String | – | Catchment surface material | `rcc`, `metal`, `tiles`, `pavers` |
| `runoff_coefficient` | Float | – | Physical runoff efficiency factor | 0.70 – 0.90 |
| `occupants` | Integer | count | Number of permanent property residents | 1 – 45 |
| `daily_water_demand_l` | Float | Litres/day | Total daily domestic water consumption | 120 – 6,500 L |
| `annual_water_demand_l` | Float | Litres/year | Total annual domestic water requirement | Daily × 365 |
| `soil_type` | String | – | Infiltration soil classification | `sandy`, `loamy`, `silty`, `clay`, `rocky` |
| `open_area_m2` | Float | m² | Unpaved permeable ground area available | 0 – 600 m² |
| `drainage_available` | Boolean | – | Stormwater municipal / storm drain connectivity | `True`, `False` |
| `groundwater_recharge_preference` | Boolean | – | Explicit user preference towards aquifer conservation | `True`, `False` |
| `property_type` | String | – | Built environment occupancy classification | `residential`, `commercial`, `institutional`, `industrial` |
| `budget` | Float | INR (₹) | Maximum capital expenditure limit | ₹15,000 – ₹450,000 |
| `estimated_harvest_l` | Float | Litres/year | Deterministic gross yield adjusted for filter | $P \times A \times C \times 0.90$ |
| `harvest_to_demand_ratio` | Float | ratio | Yield over annual demand coverage ratio | 0.05 – 8.5 |
| `roof_to_open_area_ratio` | Float | ratio | Catchment area relative to available permeable space | 0.1 – 50.0 |
| `estimated_monthly_harvest` | Float | Litres/month | Average monthly harvest volume | `estimated_harvest_l / 12` |
| `estimated_annual_savings` | Float | INR/year | Avoided municipal tanker water expenditure | $\min(\text{Harvest}, \text{Demand}) \times 0.05$ |
| **`recommended_system`** | **String (Target)** | – | **Ground-truth engineering classification** | `Storage Tank`, `Recharge Pit`, `Recharge Well`, `Hybrid System` |

#### Engineering Labeling Logic:
1. **`Storage Tank`**: Recommended when open ground space is negligible ($< 15\,\text{m}^2$) OR soil is impermeable ($k \le 5\,\text{mm/hr}$ for clay/rocky) OR storage preference is selected with high domestic demand.
2. **`Recharge Pit`**: Recommended when water demand is modest, permeable open space is adequate ($20 - 150\,\text{m}^2$), soil is sandy/loamy ($k \ge 15\,\text{mm/hr}$), and catchment is moderate ($< 250\,\text{m}^2$).
3. **`Recharge Well`**: Recommended for large roof catchments ($\ge 250\,\text{m}^2$), high runoff volumes, open permeable space ($> 60\,\text{m}^2$), and existing borewell/deep recharge shaft conditions.
4. **`Hybrid System`**: Recommended when harvest potential is high ($\ge 60,000\,\text{L}$), water demand is high, permeable open area is available ($\ge 25\,\text{m}^2$), soil can accept overflow ($k \ge 10\,\text{mm/hr}$), and budget is sufficient ($\ge ₹60,000$).

---

### B. Rainfall Climate Time-Series Dataset (`rainfall_climate_dataset.csv`)

- **Purpose**: Training time-series regression and seasonal regime classification models.
- **Geographic Coverage**: 15 distinct Indian climatic regions (Bengaluru, Mumbai, Delhi, Chennai, Hyderabad, Pune, Jaipur, Kolkata, Kochi, Ahmedabad, Bhopal, Lucknow, Guwahati, Nagpur, Patna).
- **Time Period**: 2005 – 2024 (240 continuous months per station = 3,600 monthly samples).
- **Chronological Split**: 2005–2019 (Training: 2,700 samples), 2020–2024 (Out-of-Time Test: 900 samples).

---

## 3. Real-World Data Integration Guidelines

To ingest live meteorological feeds from government agencies or external APIs:
1. **IMD / Open-Meteo**: Place raw historical CSVs into `data/raw/`.
2. **Standardization Pipeline**: Ensure latitude, longitude, and elevation are validated against WGS84 standards.
3. **Missing Value Protocol**: Use median imputation for numerical data and forward-fill for time-series gaps shorter than 2 months.
