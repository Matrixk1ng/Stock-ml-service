"""
Database Utilities - Centralized database connection and helpers

All database access should go through this module to ensure:
1. Single connection pool
2. Consistent error handling
3. Lambda-friendly connection management
"""

import os
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool

# For Lambda, use NullPool to avoid connection pooling issues
# Lambda functions should create fresh connections each invocation
_engine = None

def get_engine():
    """
    Get or create the database engine.
    Uses NullPool for Lambda compatibility.
    """
    global _engine
    
    if _engine is None:
        db_url = os.getenv("DB_URL")
        
        if not db_url:
            raise ValueError(
                "DB_URL environment variable is required. "
                "Format: postgresql+psycopg2://user:pass@host:5432/dbname"
            )
        
        # NullPool is recommended for Lambda - no persistent connections
        # Each query creates and closes its own connection
        _engine = create_engine(
            db_url,
            poolclass=NullPool,  # Lambda-friendly - no connection pool
            echo=False,          # Set to True for SQL debugging
        )
    
    return _engine


def get_universe(limit: int | None = None) -> list[str]:
    """
    Fetch the list of stock tickers from the database.
    
    Args:
        limit: Maximum number of tickers to return (None = all)
    
    Returns:
        List of ticker symbols (uppercase)
    """
    engine = get_engine()
    
    query = "SELECT ticker FROM stocks ORDER BY ticker"
    params = {}
    
    if limit:
        query += " LIMIT %(lim)s"
        params["lim"] = limit
    
    try:
        df = pd.read_sql(query, engine, params=params if params else None)
        tickers = df["ticker"].str.upper().tolist()
        
        if not tickers:
            print("WARNING: No tickers found in 'stocks' table")
        
        return tickers
        
    except Exception as e:
        print(f"ERROR fetching universe: {e}")
        raise


def to_date(x):
    """
    Safely convert various date types to datetime.date.
    
    Args:
        x: Date value (None, str, Timestamp, datetime, date)
    
    Returns:
        datetime.date or None
    """
    if x is None:
        return None
    
    if isinstance(x, str):
        return pd.to_datetime(x).date()
    
    # Handle pandas Timestamp
    if hasattr(x, 'date'):
        return x.date()
    
    # Already a date
    return x


def execute_query(query: str, params: dict = None):
    """
    Execute a query and return the result.
    
    Args:
        query: SQL query string
        params: Query parameters
    
    Returns:
        Result proxy from SQLAlchemy
    """
    engine = get_engine()
    
    with engine.connect() as conn:
        result = conn.execute(text(query), params or {})
        conn.commit()
        return result


def to_date(x):
    """
    Safely convert various date types to datetime.date.
    """
    if x is None:
        return None
    
    if isinstance(x, str):
        return pd.to_datetime(x).date()
    
    if hasattr(x, 'date'):
        return x.date()
    
    return x