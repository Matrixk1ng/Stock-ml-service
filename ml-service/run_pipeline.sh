#!/bin/sh
echo "Starting Feature ETL..."
python feature_etl.py
echo "Starting Signal Generation..."
python build_signals.py