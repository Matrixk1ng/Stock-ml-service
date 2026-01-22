import numpy as np
import pandas as pd
import joblib
from pathlib import Path

from model_store import download_model

def score_risk_with_existing_model(df: pd.DataFrame, symbol: str, risk_features: list[str]) -> pd.Series:
    """
    DAILY: download model from S3 and score. No training.
    """
    symbol = symbol.upper()

    X = df[risk_features].astype(float)
    X = X.replace([np.inf, -np.inf], np.nan).dropna()

    if X.empty or len(X) < 200:
        return pd.Series(index=df.index, data=np.nan)

    local_path = Path("/tmp/models") / symbol / f"{symbol.lower()}_iso_forest.pkl"
    local_path.parent.mkdir(parents=True, exist_ok=True)

    download_model(symbol, local_path)
    iso = joblib.load(local_path)

    raw = -iso.decision_function(X)
    raw_s = pd.Series(raw, index=X.index)

    risk = raw_s.rank(pct=True) * 100.0
    return risk.reindex(df.index)
