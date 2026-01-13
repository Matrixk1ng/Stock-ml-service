package com.obinna.StockAnalysis.Repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

@Repository
public class PriceIngestionRepository {

    private final JdbcTemplate jdbcTemplate;

    public PriceIngestionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void batchInsertIgnore(List<PriceRow> rows) {

        String sql = """
                    INSERT INTO prices (
                        ticker,
                        price_date,
                        open_price,
                        high_price,
                        low_price,
                        close_price,
                        volume
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT (ticker, price_date) DO NOTHING
                """;

        jdbcTemplate.batchUpdate(
                sql,
                rows,
                1000, // batch size
                (ps, row) -> {
                    ps.setString(1, row.ticker());
                    ps.setDate(2, Date.valueOf(row.date()));
                    ps.setDouble(3, row.open());
                    ps.setDouble(4, row.high());
                    ps.setDouble(5, row.low());
                    ps.setDouble(6, row.close());
                    ps.setLong(7, row.volume());
                });
    }

    public void upsertStock(String ticker, String name, String sector, String industry, Long mktCap) {
        String sql = """
                    INSERT INTO stocks (
                        ticker, company_name, sector, industry, market_cap,
                        market_cap_updated_at, last_metadata_refresh
                    )
                    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    ON CONFLICT (ticker) DO UPDATE SET
                        company_name = EXCLUDED.company_name,
                        sector = EXCLUDED.sector,
                        industry = EXCLUDED.industry,
                        market_cap = EXCLUDED.market_cap,
                        market_cap_updated_at = CURRENT_TIMESTAMP,
                        last_metadata_refresh = CURRENT_TIMESTAMP
                """;

        jdbcTemplate.update(sql, ticker, name, sector, industry, mktCap);
    }

    // Lightweight DTO for ingestion (NOT an entity)
    public record PriceRow(
            String ticker,
            LocalDate date,
            double open,
            double high,
            double low,
            double close,
            long volume) {
    }

    public void ensureStockRowExists(String ticker) {
        String sql = """
                    INSERT INTO stocks (ticker)
                    VALUES (?)
                    ON CONFLICT (ticker) DO NOTHING
                """;
        jdbcTemplate.update(sql, ticker);
    }

    public record StockMeta(
            java.time.Instant lastMetadataRefresh,
            String sector,
            String industry,
            Long marketCap) {
    }

    public StockMeta getStockMeta(String ticker) {
        String sql = """
                    SELECT last_metadata_refresh, sector, industry, market_cap
                    FROM stocks
                    WHERE ticker = ?
                """;

        return jdbcTemplate.query(sql, rs -> {
            if (!rs.next())
                return null;
            var ts = rs.getTimestamp("last_metadata_refresh");
            return new StockMeta(
                    ts == null ? null : ts.toInstant(),
                    rs.getString("sector"),
                    rs.getString("industry"),
                    (Long) rs.getObject("market_cap"));
        }, ticker);
    }

}
