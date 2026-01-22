import os
from pathlib import Path
import boto3

s3 = boto3.client("s3")

MODEL_BUCKET = os.getenv("MODEL_BUCKET")
MODEL_PREFIX = os.getenv("MODEL_PREFIX", "stocks/models")

def _key(symbol: str) -> str:
    sym = symbol.upper()
    return f"{MODEL_PREFIX}/{sym}/{sym.lower()}_iso_forest.pkl"

def download_model(symbol: str, local_path: Path) -> None:
    if not MODEL_BUCKET:
        raise RuntimeError("MODEL_BUCKET env var is required")
    s3.download_file(MODEL_BUCKET, _key(symbol), str(local_path))

def upload_model(symbol: str, local_path: Path) -> None:
    if not MODEL_BUCKET:
        raise RuntimeError("MODEL_BUCKET env var is required")
    s3.upload_file(str(local_path), MODEL_BUCKET, _key(symbol))
