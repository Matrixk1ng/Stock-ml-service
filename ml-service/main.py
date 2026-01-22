import os
from feature_etl import build_all_features
from build_signals import build_all_signals

job = os.getenv("JOB", "daily").lower()  # daily or monthly

if job == "daily":
    build_all_features()
    build_all_signals(mode="daily")
elif job == "monthly":
    build_all_features()
    build_all_signals(mode="monthly")
else:
    raise ValueError("JOB must be 'daily' or 'monthly'")
