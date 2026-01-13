CREATE TABLE stocks (
    ticker VARCHAR(10) PRIMARY KEY,
    company_name TEXT,
    sector VARCHAR(50),
    industry VARCHAR(100),
    market_cap BIGINT,
    market_cap_updated_at TIMESTAMP,
    last_metadata_refresh TIMESTAMP
);


-- Create prices table for raw market data
CREATE TABLE prices (
    ticker VARCHAR(10) NOT NULL,
    price_date DATE NOT NULL,
    open_price DECIMAL(12,4),
    high_price DECIMAL(12,4),
    low_price DECIMAL(12,4),
    close_price DECIMAL(12,4),
    volume BIGINT,
    PRIMARY KEY (ticker, price_date),
    FOREIGN KEY (ticker) REFERENCES stocks(ticker)
);

-- for ML model
CREATE TABLE features (
    ticker VARCHAR(10) NOT NULL,
    feature_date DATE NOT NULL,

    log_return_1d DOUBLE PRECISION,
    log_return_7d DOUBLE PRECISION,
    log_return_14d DOUBLE PRECISION,

    vol_14d DOUBLE PRECISION,
    vol_30d DOUBLE PRECISION,

    drawdown_30d DOUBLE PRECISION,
    rsi_14 DOUBLE PRECISION,
    volume_z_30d DOUBLE PRECISION,

    corr_60d DOUBLE PRECISION,
    beta_60d DOUBLE PRECISION,

    PRIMARY KEY (ticker, feature_date),
    FOREIGN KEY (ticker) REFERENCES stocks(ticker)
);


-- Create ml_signals table for intelligence output
CREATE TABLE ml_signals (
    ticker VARCHAR(10) NOT NULL,
    signal_date DATE NOT NULL,

    regime_label VARCHAR(50),
    risk_score INTEGER,
    drivers_json JSONB,

    PRIMARY KEY (ticker, signal_date),
    FOREIGN KEY (ticker) REFERENCES stocks(ticker)
);


-- Index for faster lookup when fetching historical windows for ML
CREATE INDEX IF NOT EXISTS idx_prices_ticker_date ON prices (ticker, price_date);
CREATE INDEX IF NOT EXISTS idx_features_ticker_date ON features (ticker, feature_date);
CREATE INDEX IF NOT EXISTS idx_signals_ticker_date ON ml_signals (ticker, signal_date);

