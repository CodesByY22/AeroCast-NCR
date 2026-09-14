import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

PROCESSED_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "processed", "fused_ncr_dataset.csv")
OUTPUT_PLOT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs", "eda_plots")

def generate_eda_artifacts():
    os.makedirs(OUTPUT_PLOT_DIR, exist_ok=True)
    print(f"[EDA Analysis] Loading fused dataset from {PROCESSED_FILE}...")
    
    df = pd.read_csv(PROCESSED_FILE)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Configure plot aesthetic style
    plt.style.use('dark_background')
    plt.rcParams['font.family'] = 'sans-serif'
    
    # 1. Pollution Time Series Plot
    fig, ax = plt.subplots(figsize=(12, 5))
    ax.plot(df['timestamp'], df['pm25'], label='PM2.5 (µg/m³)', color='#ff7e00', linewidth=2)
    ax.plot(df['timestamp'], df['pm10'], label='PM10 (µg/m³)', color='#e02424', linewidth=1.5, alpha=0.8)
    ax.plot(df['timestamp'], df['no2'], label='NO2 (µg/m³)', color='#0284c7', linewidth=1.5, alpha=0.8)
    ax.set_title('AeroCast NCR - Ground Pollutant Time Series (Delhi NCR Average)', fontsize=14, fontweight='bold', color='#f1f5f9')
    ax.set_xlabel('Timestamp (IST)', fontsize=10, color='#94a3b8')
    ax.set_ylabel('Concentration (µg/m³)', fontsize=10, color='#94a3b8')
    ax.grid(True, linestyle='--', alpha=0.3)
    ax.legend(loc='upper right')
    plt.tight_layout()
    plot1_path = os.path.join(OUTPUT_PLOT_DIR, "pollution_timeseries.png")
    plt.savefig(plot1_path, dpi=150)
    plt.close()
    print(f"[EDA Analysis] Saved Plot 1: {plot1_path}")
    
    # 2. PM2.5 vs Meteorological Drivers (2x2 Subplots)
    fig, axes = plt.subplots(2, 2, figsize=(12, 9))
    
    # (a) PM2.5 vs Wind Speed
    sns.scatterplot(data=df, x='wind_speed_10m', y='pm25', hue='inversion_proxy_index', palette='plasma', ax=axes[0, 0], s=40)
    axes[0, 0].set_title('PM2.5 vs Surface Wind Speed (10m)', fontsize=11, fontweight='bold')
    axes[0, 0].set_xlabel('Wind Speed (m/s)')
    axes[0, 0].set_ylabel('PM2.5 (µg/m³)')
    axes[0, 0].grid(True, linestyle='--', alpha=0.2)
    
    # (b) PM2.5 vs Ventilation Index Proxy
    sns.scatterplot(data=df, x='ventilation_index_proxy', y='pm25', color='#06b6d4', ax=axes[0, 1], s=40)
    axes[0, 1].set_title('PM2.5 vs Boundary Layer Ventilation Proxy (m²/s)', fontsize=11, fontweight='bold')
    axes[0, 1].set_xlabel('Ventilation Index Proxy (Wind Speed × PBL Height)')
    axes[0, 1].set_ylabel('PM2.5 (µg/m³)')
    axes[0, 1].grid(True, linestyle='--', alpha=0.2)
    
    # (c) PM2.5 vs Inversion Proxy Index
    sns.regplot(data=df, x='inversion_proxy_index', y='pm25', color='#f59e0b', ax=axes[1, 0], scatter_kws={'s': 30, 'alpha': 0.6})
    axes[1, 0].set_title('PM2.5 vs Temperature Inversion Proxy Index (0-100)', fontsize=11, fontweight='bold')
    axes[1, 0].set_xlabel('Inversion Proxy Index')
    axes[1, 0].set_ylabel('PM2.5 (µg/m³)')
    axes[1, 0].grid(True, linestyle='--', alpha=0.2)
    
    # (d) Relative Humidity vs PM2.5
    sns.scatterplot(data=df, x='rh_2m', y='pm25', color='#10b981', ax=axes[1, 1], s=40)
    axes[1, 1].set_title('PM2.5 vs Relative Humidity (2m)', fontsize=11, fontweight='bold')
    axes[1, 1].set_xlabel('Relative Humidity (%)')
    axes[1, 1].set_ylabel('PM2.5 (µg/m³)')
    axes[1, 1].grid(True, linestyle='--', alpha=0.2)
    
    plt.tight_layout()
    plot2_path = os.path.join(OUTPUT_PLOT_DIR, "pm25_vs_met_drivers.png")
    plt.savefig(plot2_path, dpi=150)
    plt.close()
    print(f"[EDA Analysis] Saved Plot 2: {plot2_path}")
    
    # 3. PM2.5 vs Fire Activity & Stubble Risk
    fig, ax1 = plt.subplots(figsize=(12, 5))
    ax2 = ax1.twinx()
    
    ax1.plot(df['timestamp'], df['pm25'], color='#ff7e00', label='PM2.5 (µg/m³)', linewidth=2)
    ax2.bar(df['timestamp'], df['stubble_transport_risk'], color='#ef4444', alpha=0.4, width=0.03, label='Stubble Transport Risk Index')
    
    ax1.set_title('PM2.5 Concentration vs Stubble Transport Risk Score', fontsize=14, fontweight='bold')
    ax1.set_xlabel('Timestamp (IST)')
    ax1.set_ylabel('PM2.5 (µg/m³)', color='#ff7e00')
    ax2.set_ylabel('Stubble Transport Risk Score (0-100)', color='#ef4444')
    ax1.grid(True, linestyle='--', alpha=0.2)
    
    plt.tight_layout()
    plot3_path = os.path.join(OUTPUT_PLOT_DIR, "pm25_vs_fire_stubble.png")
    plt.savefig(plot3_path, dpi=150)
    plt.close()
    print(f"[EDA Analysis] Saved Plot 3: {plot3_path}")
    
    # Print EDA Key Correlation Summary
    print("\n--- EDA FEATURE CORRELATION WITH PM2.5 ---")
    corrs = df.corr(numeric_only=True)['pm25'].sort_values(ascending=False)
    for col, val in corrs.items():
        print(f"  {col:30s} : {val:+.4f}")
    print("------------------------------------------\n")

if __name__ == "__main__":
    generate_eda_artifacts()
