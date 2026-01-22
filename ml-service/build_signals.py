import os
import numpy as np
import pandas as pd
from sqlalchemy import text
from psycopg2.extras import execute_values, Json
from db_utils import get_engine, get_universe
from Model_Functions import (
    score_risk_with_existing_model,
    train_and_save_model,
    score_risk_with_model_obj,
)

# Get centralized engine - NO MORE local create_engine calls
engine = get_engine()

# -------------------------
# CONFIG
# -------------------------

# Features used for risk model
RISK_FEATURES = [
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

# Drivers shown in JSON ("why?")
DRIVER_FEATURES = [
    "vol_30d",
    "volume_z_30d",
    "drawdown_30d",
    "corr_60d",
    "beta_60d",
]

# Lookbacks
DRIVER_LOOKBACK = 252          # trailing trading days for percentiles
TRAINING_WINDOW_DAYS = 1500    # how much history to train per ticker
BUFFER_DAYS = 400              # ensures you have enough rolling history for new rows

UPSERT_SIGNALS_SQL = """
INSERT INTO ml_signals (
  ticker, signal_date,
  regime_label, risk_score, drivers_json
) VALUES %s
ON CONFLICT (ticker, signal_date)
DO UPDATE SET
  regime_label = EXCLUDED.regime_label,
  risk_score = EXCLUDED.risk_score,
  drivers_json = EXCLUDED.drivers_json;
"""

# -------------------------
# DB HELPERS
# -------------------------

def get_last_signal_date(symbol: str):
    symbol = symbol.upper()
    with engine.connect() as conn:
        return conn.execute(
            text("SELECT max(signal_date) FROM ml_signals WHERE ticker = :t"),
            {"t": symbol},
        ).scalar()

def fetch_feature_window(symbol: str, start_date) -> pd.DataFrame:
    symbol = symbol.upper()
    return pd.read_sql(
        """
        SELECT
          ticker,
          feature_date,
          log_return_1d, log_return_7d, log_return_14d,
          vol_14d, vol_30d,
          drawdown_30d, rsi_14, volume_z_30d,
          corr_60d, beta_60d
        FROM features
        WHERE ticker = %(t)s
          AND feature_date >= %(start)s
        ORDER BY feature_date ASC
        """,
        engine,
        params={"t": symbol, "start": start_date},
        parse_dates=["feature_date"],
    )

# -------------------------
# FEATURE UTILS
# -------------------------

def to_date(x):
    if x is None:
        return None
    return pd.to_datetime(x).date()

def rolling_percentile(window_vals: np.ndarray, current_val: float) -> float:
    """
    Percentile rank of current_val within window_vals (0..1).
    """
    if len(window_vals) == 0 or np.isnan(current_val):
        return np.nan
    w = window_vals[~np.isnan(window_vals)]
    if len(w) == 0:
        return np.nan
    return float((w <= current_val).mean())

def compute_drivers_for_row(df: pd.DataFrame, i: int) -> dict:
    """
    Build drivers_json for df row index i using trailing DRIVER_LOOKBACK rows.
    Uses "extremeness" = max(p, 1-p) so both high/low outliers get surfaced.
    """
    start_i = max(0, i - DRIVER_LOOKBACK)
    window_df = df.iloc[start_i:i+1]  # include current row

    drivers = []
    for col in DRIVER_FEATURES:
        cur = df.at[i, col]
        if col == "volume_z_30d":
            # for volume anomaly, use absolute magnitude
            w = window_df[col].abs().to_numpy(dtype=float)
            cur_val = float(abs(cur)) if cur is not None else np.nan
            pct = rolling_percentile(w, cur_val)
            shown_val = float(cur) if cur is not None else None
        else:
            w = window_df[col].to_numpy(dtype=float)
            cur_val = float(cur) if cur is not None else np.nan
            pct = rolling_percentile(w, cur_val)
            shown_val = float(cur) if cur is not None else None

        if np.isnan(pct):
            continue

        extremeness = max(pct, 1.0 - pct)
        drivers.append({
            "feature": col,
            "value": shown_val,
            "pct": round(pct, 4),
            "extreme": round(extremeness, 4),
        })

    drivers.sort(key=lambda d: d["extreme"], reverse=True)
    top3 = drivers[:3]

    return {"top_drivers": [{"feature": d["feature"], "value": d["value"], "pct": d["pct"]} for d in top3]}

# -------------------------
# MODELING
# -------------------------

def label_regime(row) -> str:
    """
    Simple, resume-safe regime labeling.
    """
    vol = row["vol_30d"]
    r14 = row["log_return_14d"]

    if pd.isna(vol) or pd.isna(r14):
        return "UNKNOWN"

    if vol >= 0.03:
        return "HIGH_VOLATILITY"
    if r14 >= 0.03:
        return "TREND_UP"
    if r14 <= -0.03:
        return "TREND_DOWN"
    return "SIDEWAYS"

# -------------------------
# UPSERT
# -------------------------

def upsert_signals_fast(rows: list[tuple], page_size: int = 20000) -> int:
    if not rows:
        return 0

    raw = engine.raw_connection()
    try:
        with raw.cursor() as cur:
            execute_values(cur, UPSERT_SIGNALS_SQL, rows, page_size=page_size)
        raw.commit()
    except Exception:
        raw.rollback()
        raise
    finally:
        raw.close()

    return len(rows)

# -------------------------
# CORE PIPELINE
# -------------------------

def build_signals_for_ticker(symbol: str, mode: str) -> int:
    symbol = symbol.upper()

    last_sig = to_date(get_last_signal_date(symbol))
    today = pd.Timestamp.today().date()

    if last_sig:
        start = min(
            (pd.Timestamp(last_sig) - pd.Timedelta(days=BUFFER_DAYS)).date(),
            (pd.Timestamp(today) - pd.Timedelta(days=TRAINING_WINDOW_DAYS)).date(),
        )
    else:
        start = (pd.Timestamp(today) - pd.Timedelta(days=TRAINING_WINDOW_DAYS)).date()

    df = fetch_feature_window(symbol, start)
    if df.empty:
        return 0

    df["feature_date"] = pd.to_datetime(df["feature_date"]).dt.date

    # -------- MODEL STEP --------
    if mode == "monthly":
        iso = train_and_save_model(df, symbol, RISK_FEATURES)
        df["risk_score_raw"] = score_risk_with_model_obj(df, iso, RISK_FEATURES)
    else:
        df["risk_score_raw"] = score_risk_with_existing_model(df, symbol, RISK_FEATURES)

    df["regime_label"] = df.apply(label_regime, axis=1)

    if last_sig:
        new_df = df[df["feature_date"] > last_sig].copy()
    else:
        new_df = df.copy()

    new_df = new_df.dropna(subset=["risk_score_raw"])
    if new_df.empty:
        return 0

    date_to_idx = {d: i for i, d in enumerate(df["feature_date"].tolist())}
    new_df["drivers_json"] = [
        compute_drivers_for_row(df, date_to_idx[d])
        if d in date_to_idx else {"top_drivers": []}
        for d in new_df["feature_date"]
    ]

    new_df["risk_score"] = (
        new_df["risk_score_raw"].clip(0, 100).round().astype(int)
    )

    rows = [
        (
            symbol,
            r["feature_date"],
            r["regime_label"],
            int(r["risk_score"]),
            Json(r["drivers_json"]),
        )
        for _, r in new_df.iterrows()
    ]

    return upsert_signals_fast(rows)

def build_all_signals(mode: str, limit: int | None = None):
    tickers = get_universe(limit=limit)
    total = 0

    for t in tickers:
        try:
            total += build_signals_for_ticker(t, mode)
        except Exception as e:
            print(f"[FAIL] {t}: {e}")

    print(f"[DONE] inserted_or_updated={total}")

if __name__ == "__main__":
    job_mode = os.getenv("JOB_MODE", "daily").lower()
    run_limit = os.getenv("RUN_LIMIT")
    run_limit = int(run_limit) if run_limit else None

    print(f"[START] Running {job_mode} pipeline. Limit: {run_limit}")
    build_all_signals(mode=job_mode, limit=run_limit)