# AeroCast NCR - Data Dictionary & Unified Schema

## Timestamp & Coordinate Standards
- **Timezone**: `Asia/Kolkata` (IST) / ISO 8601 UTC string.
- **Coordinate Reference System (CRS)**: `EPSG:4326` (WGS84 Lat/Lon).

## Unified Data Fusion Schema

| Column Name | Data Type | Source | Unit | Description |
| :--- | :--- | :--- | :--- | :--- |
| `timestamp` | Datetime (ISO) | Pipeline | IST / UTC | Hourly observation timestamp |
| `latitude` | Float64 | OpenAQ / Sensor | Degrees N | Sensor latitude |
| `longitude` | Float64 | OpenAQ / Sensor | Degrees E | Sensor longitude |
| `pm25` | Float64 | OpenAQ / CPCB | $\mu\text{g/m}^3$ | $\text{PM}_{2.5}$ concentration |
| `pm10` | Float64 | OpenAQ / CPCB | $\mu\text{g/m}^3$ | $\text{PM}_{10}$ concentration |
| `no2` | Float64 | OpenAQ / CPCB | $\mu\text{g/m}^3$ | $\text{NO}_2$ concentration |
| `o3` | Float64 | OpenAQ / CPCB | $\mu\text{g/m}^3$ | Ozone concentration |
| `temp_2m` | Float64 | Open-Meteo | ${}^\circ\text{C}$ | Surface air temperature at 2 meters |
| `rh_2m` | Float64 | Open-Meteo | $\%$ | Relative humidity at 2 meters |
| `wind_speed_10m` | Float64 | Open-Meteo | $\text{m/s}$ | Surface wind speed at 10 meters |
| `wind_dir_10m` | Float64 | Open-Meteo | Degrees | Wind direction at 10 meters ($0^\circ-360^\circ$) |
| `surface_pressure` | Float64 | Open-Meteo | $\text{hPa}$ | Atmospheric surface pressure |
| `pbl_height_proxy` | Float64 | Open-Meteo / ERA5 | $\text{m}$ | Planetary Boundary Layer height proxy |
| `fire_count_200km` | Int64 | NASA FIRMS | Count | Number of active upwind fires within 200km |
| `total_frp_200km` | Float64 | NASA FIRMS | $\text{MW}$ | Total Fire Radiative Power in upwind sector |
| `ventilation_index_proxy` | Float64 | Derived | $\text{m}^2/\text{s}$ | $\text{Wind\_Speed} \times \text{PBL\_Height\_Proxy}$ |
| `inversion_proxy_index` | Float64 | Derived | Scale $0-100$ | Thermal stability / inversion strength proxy |
| `stubble_transport_risk` | Float64 | Derived | Scale $0-100$ | Integrated upwind fire vector risk score |
