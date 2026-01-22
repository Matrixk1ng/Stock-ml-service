import pandas as pd
import numpy as np
import pandas_ta as ta
from sqlalchemy import text
from psycopg2.extras import execute_values
from db_utils import get_engine, get_universe

# Get centralized engine - NO MORE local create_engine calls
engine = get_engine()

# Cache SPY data to avoid reloading multiple times
_SPY_CACHE = None

def get_spy_df_cached() -> pd.DataFrame:
    global _SPY_CACHE
    if _SPY_CACHE is None:
        _SPY_CACHE = load_spy_df()
    return _SPY_CACHE

FEATURE_COLS = [
    "ticker",
    "feature_date",
    "log_return_1d",
    "log_return_7d",
    "log_return_14d",
    "vol_14d",
    "vol_30d",
    "drawdown_30d",
    "rsi_14",
    "volume_z_30d",
    "corr_60d",
    "beta_60d",
]

UPSERT_FEATURES_SQL = """
INSERT INTO features (
  ticker, feature_date,
  log_return_1d, log_return_7d, log_return_14d,
  vol_14d, vol_30d,
  drawdown_30d, rsi_14, volume_z_30d,
  corr_60d, beta_60d
) VALUES %s
ON CONFLICT (ticker, feature_date)
DO UPDATE SET
  log_return_1d = EXCLUDED.log_return_1d,
  log_return_7d = EXCLUDED.log_return_7d,
  log_return_14d = EXCLUDED.log_return_14d,
  vol_14d = EXCLUDED.vol_14d,
  vol_30d = EXCLUDED.vol_30d,
  drawdown_30d = EXCLUDED.drawdown_30d,
  rsi_14 = EXCLUDED.rsi_14,
  volume_z_30d = EXCLUDED.volume_z_30d,
  corr_60d = EXCLUDED.corr_60d,
  beta_60d = EXCLUDED.beta_60d;
"""

def load_spy_df() -> pd.DataFrame:
    spy_df = pd.read_sql(
        """
        SELECT price_date AS date, close_price AS spy_close
        FROM prices
        WHERE ticker = 'SPY'
        ORDER BY price_date ASC
        """,
        engine,
        parse_dates=["date"],
    )
    spy_df["spy_log_return"] = np.log(spy_df["spy_close"] / spy_df["spy_close"].shift(1))
    return spy_df

def get_last_feature_date(symbol: str):
    symbol = symbol.upper()
    with engine.connect() as conn:
        return conn.execute(
            text("SELECT max(feature_date) FROM features WHERE ticker = :t"),
            {"t": symbol},
        ).scalar()

def fetch_price_window(symbol: str, start_date) -> pd.DataFrame:
    symbol = symbol.upper()
    return pd.read_sql(
        """
        SELECT price_date AS date, close_price AS close, volume
        FROM prices
        WHERE ticker = %(t)s
          AND price_date >= %(start)s
        ORDER BY price_date ASC
        """,
        engine,
        params={"t": symbol, "start": start_date},
        parse_dates=["date"],
    )

def compute_features(symbol: str, prices_df: pd.DataFrame, spy_df: pd.DataFrame) -> pd.DataFrame:
    symbol = symbol.upper()
    if prices_df.empty:
        return pd.DataFrame(columns=FEATURE_COLS)

    df = prices_df.merge(spy_df[["date", "spy_close", "spy_log_return"]], on="date", how="inner")
    df["ticker"] = symbol

    # returns
    df["log_return_1d"] = np.log(df["close"] / df["close"].shift(1))
    df["log_return_7d"] = np.log(df["close"] / df["close"].shift(7))
    df["log_return_14d"] = np.log(df["close"] / df["close"].shift(14))

    # volatility
    df["vol_14d"] = df["log_return_1d"].rolling(14).std()
    df["vol_30d"] = df["log_return_1d"].rolling(30).std()

    # drawdown
    rolling_max = df["close"].rolling(30).max()
    df["drawdown_30d"] = (df["close"] - rolling_max) / rolling_max

    # momentum
    df["rsi_14"] = ta.rsi(df["close"], length=14)

    # volume anomaly
    df["volume_z_30d"] = (
        (df["volume"] - df["volume"].rolling(30).mean()) /
        df["volume"].rolling(30).std()
    )

    # market context
    window = 60
    df["corr_60d"] = df["log_return_1d"].rolling(window).corr(df["spy_log_return"])
    cov = df["log_return_1d"].rolling(window).cov(df["spy_log_return"])
    var = df["spy_log_return"].rolling(window).var()
    df["beta_60d"] = cov / var

    out = df[[
        "ticker",
        "date",
        "log_return_1d",
        "log_return_7d",
        "log_return_14d",
        "vol_14d",
        "vol_30d",
        "drawdown_30d",
        "rsi_14",
        "volume_z_30d",
        "corr_60d",
        "beta_60d",
    ]].dropna()

    out = out.rename(columns={"date": "feature_date"})
    out["feature_date"] = pd.to_datetime(out["feature_date"]).dt.date
    out = out[FEATURE_COLS].copy()

    # NaN -> None for Postgres NULL
    out = out.where(pd.notnull(out), None)
    return out

def upsert_features_fast(df: pd.DataFrame, page_size: int = 20000) -> int:
    if df.empty:
        return 0

    rows = [tuple(x) for x in df.to_numpy()]
    raw = engine.raw_connection()
    try:
        with raw.cursor() as cur:
            execute_values(cur, UPSERT_FEATURES_SQL, rows, page_size=page_size)
        raw.commit()
    except Exception:
        raw.rollback()
        raise
    finally:
        raw.close()

    return len(rows)

def build_features_for_ticker(t: str) -> int:
    t = t.upper()
    spy_df = get_spy_df_cached()

    # 1) last feature date already stored
    last_feat = get_last_feature_date(t)
    if last_feat is not None:
        last_feat = pd.to_datetime(last_feat).date()

    # 2) fetch enough history to compute rolling windows correctly
    start = (
        (pd.Timestamp(last_feat) - pd.Timedelta(days=180)).date()
        if last_feat
        else (pd.Timestamp.today() - pd.Timedelta(days=365 * 5)).date()
    )

    prices_df = fetch_price_window(t, start)
    feat_df = compute_features(t, prices_df, spy_df)

    if feat_df.empty:
        print(f"[SKIP] {t}: not enough history / missing SPY overlap")
        return 0

    # 3) ensure type, then keep only NEW dates
    feat_df["feature_date"] = pd.to_datetime(feat_df["feature_date"]).dt.date
    if last_feat:
        feat_df = feat_df[feat_df["feature_date"] > last_feat]

    if feat_df.empty:
        print(f"[OK] {t}: 0 new feature rows")
        return 0

    # 4) write only new rows
    n = upsert_features_fast(feat_df)
    print(f"[OK] {t}: {n} new feature rows")
    return n

def build_all_features(limit: int | None = None):
    tickers = get_universe(limit=limit)
    ok = fail = 0
    total = 0

    for t in tickers:
        try:
            total += build_features_for_ticker(t)
            ok += 1
        except Exception as e:
            fail += 1
            print(f"[FAIL] {t}: {e}")

    print(f"Done. ok={ok}, fail={fail}, inserted={total}")


if __name__ == "__main__":
    build_all_features(limit=20)