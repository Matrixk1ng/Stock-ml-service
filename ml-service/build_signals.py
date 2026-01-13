import os
import json
import numpy as np
import pandas as pd
from sqlalchemy import create_engine, text
from psycopg2.extras import execute_values, Json
from sklearn.ensemble import IsolationForest
from dotenv import load_dotenv


load_dotenv()
# -------------------------
# CONFIG
# -------------------------
DB_URL = os.getenv("DB_URL")

engine = create_engine(DB_URL, pool_pre_ping=True)

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
# get list of all tickers in the US
def get_universe(limit: int | None = None) -> list[str]:
    q = "SELECT ticker FROM stocks ORDER BY ticker"
    if limit:
        df = pd.read_sql(q + " LIMIT %(lim)s", engine, params={"lim": limit})
    else:
        df = pd.read_sql(q, engine)
    return df["ticker"].tolist()

# get last signal date for a given ticker
def get_last_signal_date(symbol: str):
    symbol = symbol.upper()
    with engine.connect() as conn:
        return conn.execute(
            text("SELECT max(signal_date) FROM ml_signals WHERE ticker = :t"),
            {"t": symbol},
        ).scalar()

# fetch feature window for a given ticker
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
# convert to date, handling None
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

    # Guard
    if pd.isna(vol) or pd.isna(r14):
        return "UNKNOWN"

    # High vol first
    # (This threshold is intentionally simple; you can later tune to percentiles.)
    if vol >= 0.03:
        return "HIGH_VOLATILITY"
    if r14 >= 0.03:
        return "TREND_UP"
    if r14 <= -0.03:
        return "TREND_DOWN"
    return "SIDEWAYS"

def compute_risk_scores(df: pd.DataFrame) -> pd.Series:
    """
    IsolationForest raw anomaly -> percentile -> 0..100 risk_score
    """
    X = df[RISK_FEATURES].astype(float)
    X = X.replace([np.inf, -np.inf], np.nan).dropna()

    if X.empty or len(X) < 200:
        # Not enough data to fit a stable model
        return pd.Series(index=df.index, data=np.nan)

    # Fit model on available rows in window
    iso = IsolationForest(
        n_estimators=200,
        contamination="auto",
        random_state=42,
        n_jobs=-1,
    )
    iso.fit(X)

    # decision_function: higher = more normal, so invert
    raw = -iso.decision_function(X)  # higher raw => riskier
    raw_s = pd.Series(raw, index=X.index)

    # Convert to percentile ranks (0..100)
    risk = raw_s.rank(pct=True) * 100.0
    return risk.reindex(df.index)

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


# MAIN PIPELINE (PRODUCTION MODE)
def build_signals_for_ticker(symbol: str) -> int:
    symbol = symbol.upper()

    last_sig = to_date(get_last_signal_date(symbol))
    today = pd.Timestamp.today().date()

    # Decide how far back to fetch:
    # - If first run: grab up to TRAINING_WINDOW_DAYS
    # - Else: grab enough to (a) train and (b) compute drivers percentiles for new days
    if last_sig:
        start = min(
            (pd.Timestamp(last_sig) - pd.Timedelta(days=BUFFER_DAYS)).date(),
            (pd.Timestamp(today) - pd.Timedelta(days=TRAINING_WINDOW_DAYS)).date()
        )
    else:
        start = (pd.Timestamp(today) - pd.Timedelta(days=TRAINING_WINDOW_DAYS)).date()

    df = fetch_feature_window(symbol, start)

    if df.empty:
        print(f"[SKIP] {symbol}: no features in DB")
        return 0

    # Ensure proper types
    df["feature_date"] = pd.to_datetime(df["feature_date"]).dt.date

    # Risk (fit + score)
    df["risk_score_raw"] = compute_risk_scores(df)

    # Regime
    df["regime_label"] = df.apply(label_regime, axis=1)

    # Only NEW signal dates
    if last_sig:
        new_df = df[df["feature_date"] > last_sig].copy()
    else:
        new_df = df.copy()

    # drop rows without risk
    new_df = new_df.dropna(subset=["risk_score_raw"])
    if new_df.empty:
        print(f"[OK] {symbol}: 0 new rows (or insufficient data to score)")
        return 0

    # Build drivers_json per new row (uses trailing history in full df)
    # Map feature_date -> index in df for driver lookbacks
    date_to_idx = {d: i for i, d in enumerate(df["feature_date"].tolist())}

    drivers_list = []
    for d in new_df["feature_date"].tolist():
        i = date_to_idx.get(d)
        if i is None:
            drivers_list.append({"top_drivers": []})
        else:
            drivers_list.append(compute_drivers_for_row(df, i))

    new_df["drivers_json"] = drivers_list

    # Final risk_score int 0..100
    new_df["risk_score"] = new_df["risk_score_raw"].clip(0, 100).round().astype(int)

    # Prepare rows for upsert
    rows = []
    for _, r in new_df.iterrows():
        rows.append((
            symbol,
            r["feature_date"],
            r["regime_label"],
            int(r["risk_score"]),
            Json(r["drivers_json"]),
        ))

    n = upsert_signals_fast(rows)
    print(f"[OK] {symbol}: {n} new signal rows")
    return n

def build_all_signals(limit: int | None = None):
    tickers = get_universe(limit=limit)
    ok = fail = 0
    total = 0

    for t in tickers:
        try:
            total += build_signals_for_ticker(t)
            ok += 1
        except Exception as e:
            fail += 1
            print(f"[FAIL] {t}: {e}")

    print(f"Done. ok={ok}, fail={fail}, inserted_or_updated={total}")

if __name__ == "__main__":
    # start small first:
    # build_all_signals(limit=20)

    # then run full universe:
    build_all_signals()
