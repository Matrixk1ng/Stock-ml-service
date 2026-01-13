package com.obinna.StockAnalysis.Repository;

import com.obinna.StockAnalysis.models.Price;
import com.obinna.StockAnalysis.models.PriceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Repository
public interface PriceRepository extends JpaRepository<Price, PriceId> {
    // 1. Used by Frontend: Get history for a ticker, newest first
    List<Price> findByTickerOrderByPriceDateDesc(String ticker);
    
    // No curly braces { } here! Just a semicolon at the end.
    boolean existsByTickerAndPriceDate(String ticker, LocalDate priceDate);

    @Query("SELECT p.priceDate FROM Price p WHERE p.ticker = :ticker")
    Set<LocalDate> findAllDatesByTicker(@Param("ticker") String ticker);

    @Query("select max(p.priceDate) from Price p where p.ticker = :ticker")
    LocalDate findMaxDateByTicker(@Param("ticker") String ticker);

}
