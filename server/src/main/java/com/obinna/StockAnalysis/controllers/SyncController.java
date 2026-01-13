package com.obinna.StockAnalysis.controllers;


import com.obinna.StockAnalysis.Service.FinancialModelingPrepService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class SyncController {
    @Autowired
    private FinancialModelingPrepService fmpService;

    // This is the endpoint your "Force Sync" button in React/HTML will call
    @PostMapping("/sync/{symbol}")
    public ResponseEntity<String> manualSync(@PathVariable String symbol) {
        try {
            // Re-using your existing service logic
            fmpService.getHistoricalDailyChart(symbol);
            return ResponseEntity.ok("Successfully synced " + symbol + " to AWS RDS.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Sync failed: " + e.getMessage());
        }
    }
}
