import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from sqlalchemy import create_engine

DB_URL = "postgresql://postgres:stockML86362!@stock-visualizer-db.cpu0w42ku7yy.us-east-1.rds.amazonaws.com:5432/postgres"
engine = create_engine(DB_URL, pool_pre_ping=True)
# Run
# ... for visualizing
""""""
def get_stock_data_from_db(symbol: str):
    symbol = symbol.upper()
    
    # We add ::DATE to f.feature_date to force it to match p.price_date
    query = """
    SELECT 
        p.price_date AS feature_date, 
        p.close_price AS close, 
        f.rsi_14, 
        f.vol_14d,
        f.drawdown_30d,
        f.beta_60d
    FROM prices p
    JOIN features f ON p.ticker = f.ticker 
                   AND p.price_date = f.feature_date::DATE  -- Explicit Cast Here
    WHERE p.ticker = %(t)s
    ORDER BY p.price_date ASC
    """
    
    df = pd.read_sql(query, engine, params={"t": symbol}, parse_dates=["feature_date"])
    
    if df.empty:
        print(f"No records found for {symbol}. Check if features were generated.")
        return None
        
    return df

def visualize_features(df, symbol):
    if df is None or df.empty:
        print("No data to visualize.")
        return

    sns.set_theme(style="darkgrid")
    fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(15, 12), sharex=True)

    # --- Plot 1: Close Price ---
    ax1.plot(df['feature_date'], df['close'], color='#1f77b4', label='Close Price')
    ax1.set_title(f"{symbol} Feature Analysis", fontsize=16, fontweight='bold')
    ax1.set_ylabel("Price ($)")
    ax1.legend()

    # --- Plot 2: RSI ---
    ax2.plot(df['feature_date'], df['rsi_14'], color='#9467bd', label='RSI (14)')
    ax2.axhline(70, color='red', linestyle='--', alpha=0.5)
    ax2.axhline(30, color='green', linestyle='--', alpha=0.5)
    ax2.set_ylabel("RSI Score")
    ax2.set_ylim(0, 100)
    ax2.legend()

    # --- Plot 3: Volatility ---
    ax3.fill_between(df['feature_date'], df['vol_14d'], color='#ff7f0e', alpha=0.3)
    ax3.plot(df['feature_date'], df['vol_14d'], color='#ff7f0e', label='14d Volatility')
    ax3.set_ylabel("Volatility")
    ax3.set_xlabel("Date")
    ax3.legend()

    plt.tight_layout()
    plt.show()

# --- RUN THIS PART ---
# Instead of build_all_features(), we target NVDA specifically
ticker = "NVDA"
nvda_data = get_stock_data_from_db(ticker)
visualize_features(nvda_data, ticker)
#build_all_features()
