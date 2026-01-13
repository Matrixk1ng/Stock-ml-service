package com.obinna.StockAnalysis.controllers;

import com.obinna.StockAnalysis.Service.RDS;
import com.obinna.StockAnalysis.dto.financial_modeling_prep.HistoricalChartDTO;
import com.obinna.StockAnalysis.dto.financial_modeling_prep.Screener;
import com.obinna.StockAnalysis.models.Price;
import com.obinna.StockAnalysis.models.Signal;
import com.obinna.StockAnalysis.models.Stock;
import com.obinna.StockAnalysis.Repository.StockRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rds")
public class RDSController {
    private final RDS rds;
    private final StockRepository stockRepository;

    public RDSController(RDS rds, StockRepository stockRepository) {
        this.rds = rds;
        this.stockRepository = stockRepository;
    }

    @GetMapping("/signals/{ticker}")
    public ResponseEntity<List<Signal>> getMlSignals(@PathVariable String ticker,
            @RequestParam(defaultValue = "180") int limit) {
        List<Signal> mlsignal = rds.getMlSignals(ticker, limit);

        if (mlsignal.isEmpty())
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok(mlsignal.subList(0, Math.min(limit, mlsignal.size())));
    }

    // gets historical data for the past 5 years to use for 1M, 6M and 1Y views
    @GetMapping("/historical-price-full/{symbol}")
    public ResponseEntity<List<HistoricalChartDTO>> getHistoricalDailyChart(@PathVariable String symbol) {
        // 1. Fetch the data from your RDS Service (which talks to PriceRepository)
        List<Price> prices = rds.getHistoricalChart(symbol); // Or your specific price fetch method

        if (prices.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // 2. Map the Database Entities to the Frontend DTOs
        List<HistoricalChartDTO> dtoList = prices.stream()
                .map(p -> new HistoricalChartDTO(
                        p.getPriceDate().toString(),
                        p.getOpenPrice(),
                        p.getLowPrice(),
                        p.getHighPrice(),
                        p.getClosePrice(),
                        p.getVolume()))
                .toList();

        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/stock-screener")
    public ResponseEntity<Screener[]> getStockScreener(
            @RequestParam(defaultValue = "0") Long minMarketCap,
            @RequestParam(required = false) String ticker,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String industry) {
        List<Stock> results = stockRepository.screenStocks(minMarketCap, ticker, name, sector, industry);

        Screener[] response = results.stream()
                .map(this::mapStockToScreener) // create this helper
                .toArray(Screener[]::new);

        if (response.length == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(response);
    }

    private Screener mapStockToScreener(Stock s) {
        Screener sc = new Screener();
        sc.setSymbol(s.getTicker());
        sc.setCompanyName(s.getCompanyName());
        sc.setSector(s.getSector());
        sc.setIndustry(s.getIndustry());
        sc.setMarketCap(s.getMarketCap());
        return sc;
    }

}
