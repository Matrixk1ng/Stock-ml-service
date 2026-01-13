package com.obinna.StockAnalysis.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.obinna.StockAnalysis.models.Stock;

public interface StockRepository extends JpaRepository<Stock, String> {
    // Returns just the ticker strings (e.g., ["AAPL", "MSFT", "SPY"])
    @Query("SELECT s.ticker FROM Stock s")
    List<String> findAllTickers();

    @Query("SELECT s FROM Stock s WHERE " +
           "s.marketCap >= :minCap AND " +
           "(:ticker IS NULL OR s.ticker ILIKE %:ticker%) AND " +
           "(:name IS NULL OR s.companyName ILIKE %:name%) AND " +
           "(:sector IS NULL OR s.sector = :sector) AND " +
           "(:industry IS NULL OR s.industry = :industry)")
    List<Stock> screenStocks(
        @Param("minCap") Long minCap, 
        @Param("ticker") String ticker,
        @Param("name") String name,
        @Param("sector") String sector,
        @Param("industry") String industry
    );

}