package com.obinna.StockAnalysis.controllers;

import com.obinna.StockAnalysis.StockInfo;
import com.obinna.StockAnalysis.Service.AlphaVantageService;
import com.obinna.StockAnalysis.Service.FinancialModelingPrepService;
import com.obinna.StockAnalysis.Service.FinnhubService;
import com.obinna.StockAnalysis.dto.alpha_vantage.IntradayApiResponse;
import com.obinna.StockAnalysis.dto.alpha_vantage.MarketMoversApiResponse;
import com.obinna.StockAnalysis.dto.financial_modeling_prep.*;
import com.obinna.StockAnalysis.dto.finnhub.UniversalStockList;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    private final AlphaVantageService alphaVantageService;
    private final FinnhubService finnhubService;
    private final FinancialModelingPrepService financialModelingPrepService;

    public StockController(AlphaVantageService alphaVantageService, FinnhubService finnhubService, FinancialModelingPrepService financialModelingPrepService) {
        this.alphaVantageService = alphaVantageService;
        this.finnhubService = finnhubService;
        this.financialModelingPrepService = financialModelingPrepService;
    }
    @GetMapping("/sectors-performance")
    public ResponseEntity <SectorPerformance[]> getSectorPerformance(){
        SectorPerformance[] sectors = financialModelingPrepService.getSectorPerformance();
        if(sectors.length == 0){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(sectors);
    }
    @GetMapping("/stock-screener")
    public ResponseEntity <Screener[]> getStockScreener(){
        Screener[] screener = financialModelingPrepService.getStockScreener();
        if (screener.length == 0){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(screener);

    }
    @GetMapping("/company-profile/{symbol}")
    public ResponseEntity<CompanyProfile> getCompanyProfile(@PathVariable String symbol){
        CompanyProfile profile = financialModelingPrepService.getCompanyProfile(symbol);
        if(profile == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(profile);
    }

    // price changes from 1D to 10 years
    @GetMapping("/stock-price-change/{symbol}")
    public ResponseEntity<PriceChange> getPriceChange(@PathVariable String symbol){
        PriceChange stockPriceChange = financialModelingPrepService.getPriceChange(symbol);
        if (stockPriceChange == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.ok(stockPriceChange);
    }
    // gets after hours data, ran every 5 min till 8
    @GetMapping("/after-hours/{symbol}")
    public ResponseEntity<IntradayApiResponse> getAfterHours(@PathVariable String symbol){
        IntradayApiResponse afterHoursData = alphaVantageService.getAfterHours(symbol);
        if (afterHoursData == null || afterHoursData.getTimeSeries() == null || afterHoursData.getTimeSeries().isEmpty()) {

            // If any check fails, return a 404 Not Found error.
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // If all checks pass, return the data with a 200 OK status.
        return ResponseEntity.ok(afterHoursData);
    }
    //gets historical data for the past 5 years to use for 1M, 6M and 1Y views
    @GetMapping("/historical-price-full/{symbol}")
    public ResponseEntity<List<HistoricalChart>> getHistoricalDailyChart(@PathVariable String symbol) {

        // Call the new service method
        List<HistoricalChart> historicalData = Arrays.asList(financialModelingPrepService.getHistoricalDailyChart(symbol));

        // Check if the service returned data or null (in case of an error)
        if (historicalData.isEmpty()) {
            // Return a 404 Not Found if no data was found
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        // If successful, return the data with a 200 OK status
        return ResponseEntity.ok(historicalData);
    }
    // get historical data in 5 min intervals for the bast 2 weeks
    // will be used for current day and past 5 days view and live view
    // every 5min
    @GetMapping("/historical-chart/{symbol}")
    public ResponseEntity<List<HistoricalChart>> getHistoricalChart(@PathVariable String symbol) {
        List<HistoricalChart> historicalChart = Arrays.asList(financialModelingPrepService.getHistoricalChart(symbol));
        if (historicalChart.isEmpty()) {
            // Return an error if no data was fetched
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(historicalChart);
    }
    // used to get market summaries
    @GetMapping("/finnhub/quote/{symbol}")
    public ResponseEntity<FinnhubQuote> getFinnhubQuote(@PathVariable String symbol) {
        FinnhubQuote quote = finnhubService.getQuote(symbol);
        if (quote == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(quote);
    }

    // get everything about a single stock in real time
    // used to go price changes both dollar and percent change
    // every 15 min - 30 min
    @GetMapping("/quote/{symbol}")
    public ResponseEntity<StockQuote> getStockQuote(@PathVariable String symbol) {
        StockQuote stockQuote = financialModelingPrepService.getStockQuote(symbol);
        if (stockQuote == null) {
            // Return an error if no data was fetched
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(stockQuote);
    }
    // get top market gainers, losers and active stocks
    @GetMapping("/market-leaders/{leaderType}")
    public ResponseEntity<List<MarketLeader>> getMarketLeader(@PathVariable String leaderType) {
        List<MarketLeader> marketLeaders = Arrays.asList(financialModelingPrepService.getMarketLeader(leaderType));
        if (marketLeaders.isEmpty()) {
            // Return an error if no data was fetched
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(marketLeaders);
    }
    
    // get all stocks in the US stock exchange from finnhub
    @GetMapping("/all-us-symbols")
    public ResponseEntity<List<UniversalStockList>> getUniversalStockList(){
        List<UniversalStockList> universalStocks = Arrays.asList(finnhubService.getUniversalStockList());
        if (universalStocks.isEmpty()) {
            // Return a 404 Not Found status, and call .build()
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(universalStocks);
    }

    // same with this only use if needed other use the top one
    @GetMapping("/market-movers")
    public ResponseEntity<MarketMoversApiResponse> getMarketMovers() {
        MarketMoversApiResponse marketMovers = alphaVantageService.getMarketMovers();
        if (marketMovers == null || marketMovers.getMetadata() == null) {
            // Return an error if no data was fetched
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(null);
        }
        return ResponseEntity.ok(marketMovers);
    }

    // get real time data about a stock
    // only use for emergencies since alpha advantage api rate is low
    @GetMapping("/{symbol}")
    public ResponseEntity<StockInfo> getStockInfo(@PathVariable String symbol) {
        StockInfo stockInfo = alphaVantageService.getStockInfo(symbol);
        if (stockInfo.getErrorMessage() != null) {
            // If there's an error message from the service, return it with an appropriate status
            // For simplicity, let's use 404 if data is not found, 500 for API key issues
            if (stockInfo.getErrorMessage().contains("API key not configured")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(stockInfo);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(stockInfo);
        }
        if (stockInfo.getName() == null && stockInfo.getPrice() == null) {
            // This case should be handled by errorMessage now, but as a fallback:
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new StockInfo("Data not found for symbol: " + symbol));
        }
        return ResponseEntity.ok(stockInfo);
    }
}

