package com.obinna.StockAnalysis.Service;

import com.obinna.StockAnalysis.dto.financial_modeling_prep.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;


import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class FinancialModelingPrepService {
    private final String FMP_BASE_URL = "https://financialmodelingprep.com/api/v3";
    private static final Logger LOGGER = Logger.getLogger(FinancialModelingPrepService.class.getName());

    private final RestTemplate restTemplate;

    private final String apiKey;


    public FinancialModelingPrepService(RestTemplate restTemplate, @Value("${FMP.api.key}") String apiKey) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
    }
    private boolean isApiKeyInvalid() {
        return apiKey == null || apiKey.isEmpty() || "FINNHUB_BASE_URL".equals(apiKey);
    }

    @Cacheable(value = "sector")
    public SectorPerformance [] getSectorPerformance(){
        if (isApiKeyInvalid()) {
            LOGGER.warning("FMP API Key is invalid or not configured.");
            return new SectorPerformance[0];
        }

        String screenerPath = FMP_BASE_URL + "/sectors-performance";
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(screenerPath)
                .queryParam("apikey", apiKey);
        try {
            SectorPerformance [] response;
            response = restTemplate.getForObject(uriBuilder.toUriString(), SectorPerformance[].class);
            return response;
        } catch (HttpClientErrorException e) {
            LOGGER.log(Level.SEVERE, "HTTP Client Error fetching sector performance " + e.getStatusCode(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching sector performance from FMP", e);
        }
        return new SectorPerformance[0];
    }


    @Cacheable(value = "screener")
    public Screener [] getStockScreener(){
        if (isApiKeyInvalid()) {
            LOGGER.warning("FMP API Key is invalid or not configured.");
            return new Screener[0];
        }

        String screenerPath = FMP_BASE_URL + "/stock-screener";
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(screenerPath)
                .queryParam("country", "US")
                .queryParam("apikey", apiKey);
        try {
            Screener [] response;
            response = restTemplate.getForObject(uriBuilder.toUriString(), Screener[].class);
            return response;
        } catch (HttpClientErrorException e) {
            LOGGER.log(Level.SEVERE, "HTTP Client Error fetching Stock Screener " + e.getStatusCode(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching Stock Screener from FMP", e);
        }
        return new Screener[0];
    }

    @Cacheable(value = "profile", key = "#symbol")
    public CompanyProfile getCompanyProfile(String symbol){
        if (isApiKeyInvalid()) {
            LOGGER.warning("FMP API Key is invalid or not configured.");
            return null;
        }
        String profilePath = FMP_BASE_URL + "/profile/" + symbol;
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(profilePath)
                .queryParam("apikey", apiKey);
        try {
            CompanyProfile [] response;
            response = restTemplate.getForObject(uriBuilder.toUriString(), CompanyProfile[].class);
            if (response != null && response.length > 0) {
                return response[0]; // <-- This is the successful return
            }
        } catch (HttpClientErrorException e) {
            LOGGER.log(Level.SEVERE, "HTTP Client Error fetching Company Profile for " + symbol + ": " + e.getStatusCode(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching Company Profile for " + symbol + " from FMP", e);
        }
        return null;
    }

    @Cacheable(value = "priceChanges", key = "#symbol")
    public PriceChange getPriceChange(String symbol){
        if (isApiKeyInvalid()) {
            LOGGER.warning("FMP API Key is invalid or not configured.");
            return null;
        }
        // Build the specific path for this endpoint
        String historicalDataPath = FMP_BASE_URL + "/stock-price-change/" + symbol;

        // Build the full URL with the API key
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(historicalDataPath)
                .queryParam("apikey", apiKey);
        try {
            // Make the API call and map the response to your wrapper class
            PriceChange [] response;
            response = restTemplate.getForObject(uriBuilder.toUriString(), PriceChange[].class);
            if (response != null && response.length > 0) {
                return response[0]; // <-- This is the successful return
            }

        } catch (HttpClientErrorException e) {
            LOGGER.log(Level.SEVERE, "HTTP Client Error fetching historical data for " + symbol + ": " + e.getStatusCode(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching historical data for " + symbol + " from FMP", e);
        }

        return null;
    }

    @Cacheable(value = "historicalDaily", key = "#symbol")
    //1M", "6M", "1Y" Chart Views
    public HistoricalChartFullApiResponse getHistoricalDailyChart(String symbol) {
        // Return null if the API key is missing
        if (isApiKeyInvalid()) {
            LOGGER.warning("FMP API Key is invalid or not configured.");
            return null;
        }

        // Build the specific path for this endpoint
        String historicalDataPath = FMP_BASE_URL + "/historical-price-full/" + symbol;

        // Build the full URL with the API key
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(historicalDataPath)
                .queryParam("apikey", apiKey);

        try {
            // Make the API call and map the response to your wrapper class
            HistoricalChartFullApiResponse response;
            response = restTemplate.getForObject(uriBuilder.toUriString(), HistoricalChartFullApiResponse.class);
            return response;

        } catch (HttpClientErrorException e) {
            LOGGER.log(Level.SEVERE, "HTTP Client Error fetching historical data for " + symbol + ": " + e.getStatusCode(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching historical data for " + symbol + " from FMP", e);
        }

        // Return null if there was any kind of error
        return null;
    }
    @Cacheable(value = "historicalChart", key="#symbol")
    public HistoricalChart[] getHistoricalChart(String symbol){
        if (isApiKeyInvalid()) {
            return new HistoricalChart[0];
        }
        String stockSymbol = FMP_BASE_URL + "/historical-chart/5min/" + symbol;
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(stockSymbol)
                .queryParam("apikey", apiKey);
        try {
            HistoricalChart[] response;
            response = restTemplate.getForObject(uriBuilder.toUriString(), HistoricalChart[].class);
            System.out.println("EXECUTING FMP API CALL FOR getHistoricalChart: " + symbol);
            return response;
        } catch (HttpClientErrorException e) {
            LOGGER.log(Level.SEVERE, "HTTP Client Error while fetching " + symbol +": " + e.getStatusCode() + " " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching " + symbol + " stock from Financial Modeling Prep", e);
        }


        return new HistoricalChart[0];
    }
    @Cacheable(value = "quotes", key = "#symbol")
    public StockQuote getStockQuote(String symbol){
        if (isApiKeyInvalid()) {
            return new StockQuote();
        }
        String stockSymbol = FMP_BASE_URL + "/quote/" + symbol;
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(stockSymbol)
                .queryParam("apikey", apiKey);
        try {
            StockQuote[] response;
            response = restTemplate.getForObject(uriBuilder.toUriString(), StockQuote[].class);
            System.out.println("EXECUTING FMP API CALL FOR getStockQuote: " + symbol);
            if (response != null && response.length > 0) {
                return response[0]; // <-- This is the successful return
            }
        } catch (HttpClientErrorException e) {
            LOGGER.log(Level.SEVERE, "HTTP Client Error while fetching " + symbol +": " + e.getStatusCode() + " " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching " + symbol + " stock from Financial Modeling Prep", e);
        }
        return new StockQuote();
    }
    @Cacheable(value = "marketLeaders", key = "#leaderType")
    public MarketLeader[] getMarketLeader(String leaderType){
        if (isApiKeyInvalid()) {
            return new MarketLeader[0];
        }
        String marketLeadersPath = FMP_BASE_URL + "/stock_market/" + leaderType;
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(marketLeadersPath)
                .queryParam("apikey", apiKey);
        try {
            // The rest of your logic to call the API...
            MarketLeader[] response;
            response = restTemplate.getForObject(uriBuilder.toUriString(), MarketLeader[].class);
            return response;
        } catch (HttpClientErrorException e) {
            LOGGER.log(Level.SEVERE, "HTTP Client Error while fetching top" + leaderType +": " + e.getStatusCode() + " " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching " +leaderType+ " Universal Listing from Financial Modeling Prep", e);
        }
        return new MarketLeader[0];
    }

}
