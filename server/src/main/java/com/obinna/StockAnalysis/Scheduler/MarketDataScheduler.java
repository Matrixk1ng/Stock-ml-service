package com.obinna.StockAnalysis.Scheduler;

import com.obinna.StockAnalysis.Repository.StockRepository;
import com.obinna.StockAnalysis.Service.StockBatchRunner;


import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MarketDataScheduler {


    private final StockRepository stockRepository;
    private final StockBatchRunner batchRunner;

    public MarketDataScheduler(StockRepository stockRepository, StockBatchRunner batchRunner) {
        this.stockRepository = stockRepository;
        this.batchRunner = batchRunner;
    }

    @Scheduled(cron = "0 30 18 * * MON-FRI", zone = "America/New_York")
    public void scheduleDailySync() {
        List<String> allTickers = stockRepository.findAllTickers();
        System.out.println("Starting Daily Automated Sync for " + allTickers.size() + " tickers...");
        
        try {
            // One call to rule them all. The batchRunner handles the threads.
            batchRunner.ingestAll(allTickers);
            System.out.println("Daily Automated Sync Completed successfully.");
        } catch (InterruptedException e) {
            System.err.println("Batch sync was interrupted: " + e.getMessage());
            Thread.currentThread().interrupt(); 
        }
    }
}
    