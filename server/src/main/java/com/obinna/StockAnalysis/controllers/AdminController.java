package com.obinna.StockAnalysis.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.obinna.StockAnalysis.Scheduler.MarketDataScheduler;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

  private final MarketDataScheduler scheduler;

  public AdminController(MarketDataScheduler scheduler) {
    this.scheduler = scheduler;
  }

  @PostMapping("/run-daily-sync")
  public ResponseEntity<Void> runDailySyncNow() {
    scheduler.scheduleDailySync();
    return ResponseEntity.accepted().build();
  }
}

