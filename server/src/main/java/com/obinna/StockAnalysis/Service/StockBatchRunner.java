package com.obinna.StockAnalysis.Service;

import com.google.common.util.concurrent.RateLimiter;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CompletionService;
import java.util.concurrent.ExecutorCompletionService;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
public class StockBatchRunner {
    private final FinancialModelingPrepService fmpService;

    // 5 req/sec = 300/min (tune DOWN a bit to be safe, e.g. 4.5)
    private final RateLimiter limiter = RateLimiter.create(3.0);

    // reuse pool (don’t create per run)
    private final ExecutorService pool = Executors.newFixedThreadPool(8);

    // prevent overlapping runs
    private final AtomicBoolean running = new AtomicBoolean(false);

    public StockBatchRunner(FinancialModelingPrepService fmpService) {
        this.fmpService = fmpService;
    }

    public void ingestAll(List<String> symbols) throws InterruptedException {
        if (!running.compareAndSet(false, true)) {
            System.out.println("Batch ingestion already running; skipping.");
            return;
        }

        final int maxInFlight = 64; // backpressure cap
        final Semaphore inFlight = new Semaphore(maxInFlight);
        final CompletionService<Void> ecs = new ExecutorCompletionService<>(pool);

        int submitted = 0;
        int completed = 0;

        try {
            for (String symbol : symbols) {
                inFlight.acquire(); // block if too many queued/running
                submitted++;

                ecs.submit(() -> {
                    try {
                        limiter.acquire(); // global rate-limit (NOT per-thread)
                        fmpService.getHistoricalDailyChart(symbol);
                    } catch (Exception e) {
                        System.err.println("Failed for " + symbol + ": " + e.getMessage());
                    } finally {
                        inFlight.release();
                    }
                    return null;
                });

                // optional: drain completions periodically so you can log progress
                while (completed < submitted && inFlight.availablePermits() == 0) {
                    ecs.take();
                    completed++;
                }
            }

            while (completed < submitted) {
                ecs.take();
                completed++;
            }
        } finally {
            running.set(false);
        }
    }
}
