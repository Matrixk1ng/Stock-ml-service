"""
Lambda Handlers for Stock ML Pipeline

Two handlers:
1. producer_handler - Triggered by EventBridge, fans out tickers to SQS
2. worker_handler - Triggered by SQS, processes individual tickers
"""

import json
import os
import traceback
import boto3
import socket
# Initialize SQS client at module level (reused across invocations)
sqs = boto3.client("sqs")

def get_queue_url():
    """Get queue URL with validation"""
    url = os.getenv("QUEUE_URL")
    if not url:
        raise ValueError("QUEUE_URL environment variable is required")
    return url


# ============================================================
# PRODUCER HANDLER - Triggered by EventBridge Schedule
# ============================================================
def producer_handler(event, context):
    """
    Fetches ticker universe and fans them out to SQS for parallel processing.
    
    Environment Variables:
        QUEUE_URL: SQS queue URL (required)
        JOB: 'daily' or 'monthly' (default: 'daily')
        RUN_LIMIT: Max tickers to process (default: None = all)
    
    Event Payload (optional):
        {"JOB": "monthly"} - Override job mode
    """
    print(f"Producer invoked. Event: {json.dumps(event)}")
    
    try:
        # Import here to catch import errors with better context
        from db_utils import get_universe
        
        queue_url = get_queue_url()
        
        # Determine mode: Event payload > ENV > default
        mode = event.get("JOB", os.getenv("JOB", "daily")).lower()
        if mode not in ("daily", "monthly"):
            print(f"Warning: Invalid mode '{mode}', defaulting to 'daily'")
            mode = "daily"
        
        # Get limit from ENV
        limit_env = os.getenv("RUN_LIMIT")
        limit = int(limit_env) if limit_env and limit_env.isdigit() else None
        
        print(f"Mode: {mode}, Limit: {limit}")
        
        # Fetch universe
        tickers = get_universe(limit=limit)
        
        if not tickers:
            print("WARNING: No tickers found in universe!")
            return {
                "statusCode": 200,
                "body": json.dumps({"queued": 0, "mode": mode, "warning": "No tickers found"})
            }
        
        print(f"Found {len(tickers)} tickers to process")
        
        # Fan out to SQS in batches of 10
        queued = 0
        batch = []
        failed_batches = 0
        
        for idx, ticker in enumerate(tickers):
            batch.append({
                "Id": str(idx % 10),  # SQS requires unique IDs within batch
                "MessageBody": json.dumps({
                    "ticker": ticker.upper(),
                    "mode": mode
                })
            })
            
            # SQS batch limit is 10 messages
            if len(batch) == 10:
                try:
                    response = sqs.send_message_batch(QueueUrl=queue_url, Entries=batch)
                    queued += len(response.get("Successful", []))
                    if response.get("Failed"):
                        failed_batches += 1
                        print(f"Batch failures: {response['Failed']}")
                except Exception as e:
                    failed_batches += 1
                    print(f"Error sending batch: {e}")
                batch = []
        
        # Send remaining messages
        if batch:
            try:
                # Re-number IDs for partial batch
                for i, entry in enumerate(batch):
                    entry["Id"] = str(i)
                response = sqs.send_message_batch(QueueUrl=queue_url, Entries=batch)
                queued += len(response.get("Successful", []))
            except Exception as e:
                print(f"Error sending final batch: {e}")
        
        result = {
            "queued": queued,
            "total_tickers": len(tickers),
            "mode": mode,
            "failed_batches": failed_batches
        }
        
        print(f"Producer complete: {json.dumps(result)}")
        
        return {
            "statusCode": 200,
            "body": json.dumps(result)
        }
        
    except Exception as e:
        error_msg = f"Producer failed: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }


# ============================================================
# WORKER HANDLER - Triggered by SQS
# ============================================================
def worker_handler(event, context):
    host = "stock-visualizer-db.cpu0w42ku7yy.us-east-1.rds.amazonaws.com"
    try:
        socket.create_connection((host, 5432), timeout=5)
        print("✓ Can reach RDS")
    except Exception as e:
            print(f"✗ Cannot reach RDS: {e}")
    """
    Processes individual tickers from SQS messages.
    
    SQS Message Format:
        {"ticker": "AAPL", "mode": "daily"}
    
    Processing Steps:
        1. Build/update features (feature_etl)
        2. Build/update signals (build_signals)
    """
    print(f"Worker invoked. Records: {len(event.get('Records', []))}")
    
    processed = []
    errors = []
    
    # Import inside handler to get better error messages
    try:
        from feature_etl import build_features_for_ticker
        from build_signals import build_signals_for_ticker
    except ImportError as e:
        error_msg = f"Failed to import modules: {e}\n{traceback.format_exc()}"
        print(error_msg)
        raise RuntimeError(error_msg)
    
    for record in event.get("Records", []):
        message_id = record.get("messageId", "unknown")
        
        try:
            body = json.loads(record["body"])
            ticker = (body.get("ticker") or "").upper().strip()
            mode = body.get("mode", "daily").lower()
            
            if not ticker:
                print(f"[SKIP] Message {message_id}: No ticker in body")
                continue
            
            if mode not in ("daily", "monthly"):
                print(f"[WARN] Message {message_id}: Invalid mode '{mode}', using 'daily'")
                mode = "daily"
            
            print(f"[START] {ticker} | Mode: {mode}")
            
            # Step 1: Feature ETL
            feat_count = build_features_for_ticker(ticker)
            print(f"[FEAT] {ticker}: {feat_count} feature rows")
            
            # Step 2: Signal Generation
            sig_count = build_signals_for_ticker(ticker, mode)
            print(f"[SIG] {ticker}: {sig_count} signal rows")
            
            processed.append({
                "ticker": ticker,
                "features": feat_count,
                "signals": sig_count
            })
            
            print(f"[DONE] {ticker}: {feat_count} features, {sig_count} signals")
            
        except Exception as e:
            error_detail = {
                "message_id": message_id,
                "error": str(e),
                "traceback": traceback.format_exc()
            }
            errors.append(error_detail)
            print(f"[ERROR] {error_detail}")
            
            # Re-raise to trigger SQS retry (message goes back to queue)
            # Only do this for transient errors, not permanent failures
            if "does not exist" not in str(e).lower():
                raise
    
    result = {
        "processed": len(processed),
        "errors": len(errors),
        "details": processed
    }
    
    print(f"Worker complete: {json.dumps(result)}")
    
    return {
        "statusCode": 200,
        "body": json.dumps(result)
    }


# ============================================================
# Local Testing
# ============================================================
if __name__ == "__main__":
    # Test producer (requires DB connection)
    print("Testing producer_handler...")
    os.environ.setdefault("JOB", "daily")
    os.environ.setdefault("RUN_LIMIT", "2")  # Just 2 tickers for test
    
    result = producer_handler({}, None)
    print(f"Producer result: {result}")
    
    # Test worker with mock SQS event
    print("\nTesting worker_handler...")
    mock_event = {
        "Records": [
            {
                "messageId": "test-1",
                "body": json.dumps({"ticker": "AAPL", "mode": "daily"})
            }
        ]
    }
    
    result = worker_handler(mock_event, None)
    print(f"Worker result: {result}")