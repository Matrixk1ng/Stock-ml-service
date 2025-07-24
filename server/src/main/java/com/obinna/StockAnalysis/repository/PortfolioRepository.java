package com.obinna.StockAnalysis.repository;
import com.obinna.StockAnalysis.model.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    // We find the portfolio by the user's UUID
    Optional<Portfolio> findByUser_Id(UUID userId);
}


