import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.ensemble import IsolationForest

from model_store import upload_model

def train_and_save_model(df: pd.DataFrame, symbol: str, risk_features: list[str]):
    """
    MONTHLY: train model and upload to S3.
    Returns trained model (so you can score immediately).
    """
    symbol = symbol.upper()

    X = df[risk_features].astype(float)
    X = X.replace([np.inf, -np.inf], np.nan).dropna()

    if X.empty or len(X) < 200:
        return None

    iso = IsolationForest(
        n_estimators=200,
        contamination="auto",
        random_state=42,
        n_jobs=-1,
    )
    iso.fit(X)

    local_path = Path("/tmp/models") / symbol / f"{symbol.lower()}_iso_forest.pkl"
    local_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(iso, local_path)

    upload_model(symbol, local_path)
    return iso
