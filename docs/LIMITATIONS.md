# AeroCast NCR - Scientific Limitations & Proxy Disclaimers

## Explicit Proxy Disclaimers
AeroCast NCR uses several atmospheric indicators derived from surface meteorology and satellite observations. These indicators are **explicit proxies** and must not be confused with direct high-altitude radiosonde soundings or 3D fluid dynamic simulations:

1. **Ventilation Index Proxy ($V_c$)**:
   - Calculated as $V_c = \text{Wind\_Speed}_{10\text{m}} \times \text{PBL\_Height\_Proxy}$.
   - *Limitation*: Actual ventilation relies on the full vertical wind profile across the boundary layer.
2. **Temperature Inversion Index Proxy**:
   - Estimated from surface air temperature, surface pressure, and solar radiation proxies.
   - *Limitation*: True inversion detection requires atmospheric temperature profiles ($T(z)$) at multiple pressure levels (e.g. 1000 hPa to 850 hPa).
3. **Regional Smoke Transport Risk Engine**:
   - Uses distance-weighted upwind active fire counts (NASA VIIRS/MODIS FRP) aligned with 10m surface wind direction.
   - *Limitation*: This is a geometric transport risk score, **not** a full Eulerian/Lagrangian chemical transport model (such as HYSPLIT or WRF-Chem).

## Comparison to Operational Benchmark (IITM/IMD WRF-Chem)
- **IITM/IMD System**: Solves complex 3D Navier-Stokes equations, radiative transfer, and multi-phase chemical kinetics with aerosol data assimilation at 400m resolution on supercomputers.
- **AeroCast NCR System**: A data-driven ML prototype that learns historical patterns, provides fast real-time forecasts, and offers interpretable diagnostics without heavy HPC infrastructure.
