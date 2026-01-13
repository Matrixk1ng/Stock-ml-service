package com.obinna.StockAnalysis.Repository;


import com.obinna.StockAnalysis.models.MlSignalId;
import com.obinna.StockAnalysis.models.Signal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;

public interface SignalRepository extends JpaRepository<Signal, MlSignalId> {
    @Query("SELECT s FROM Signal s WHERE s.ticker = :ticker ORDER BY s.signalDate DESC")
    List<Signal> findTopByTickerOrderBySignalDateDesc(String ticker, Pageable pageable);

    List<Signal> findTop365ByTickerOrderBySignalDateDesc(String ticker);

    List<Signal> findBySignalDateOrderByRiskScoreDesc(LocalDate signalDate);
}
