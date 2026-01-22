import numpy as np
import pandas as pd

def score_risk_with_model_obj(df: pd.DataFrame, iso, risk_features: list[str]) -> pd.Series:
    """
    Score using an already-loaded model object (used in monthly job after training).
    """
    X = df[risk_features].astype(float)
    X = X.replace([np.inf, -np.inf], np.nan).dropna()

    if X.empty or len(X) < 200 or iso is None:
        return pd.Series(index=df.index, data=np.nan)

    raw = -iso.decision_function(X)
    raw_s = pd.Series(raw, index=X.index)

    risk = raw_s.rank(pct=True) * 100.0
    return risk.reindex(df.index)
