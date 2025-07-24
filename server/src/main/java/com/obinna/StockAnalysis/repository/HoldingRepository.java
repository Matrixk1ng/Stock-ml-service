package com.obinna.StockAnalysis.repository;

import com.obinna.StockAnalysis.model.Holding;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HoldingRepository extends JpaRepository<Holding, Long> {
    // You can add custom query methods here later if needed
}