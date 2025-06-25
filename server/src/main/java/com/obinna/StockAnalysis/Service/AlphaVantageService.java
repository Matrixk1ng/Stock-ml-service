package com.obinna.StockAnalysis.Service;

import com.obinna.StockAnalysis.StockInfo;
import com.obinna.StockAnalysis.dto.alpha_vantage.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class AlphaVantageService {

    private static final Logger LOGGER = Logger.getLogger(AlphaVantageService.class.getName());

    private final RestTemplate restTemplate;

    @Value("${alphavantage.api.key}")
    private final String apiKey;

    private final String ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";

    public AlphaVantageService(RestTemplate restTemplate, @Value("${alphavantage.api.key}") String apiKey) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;

    }
    @Cacheable("afterHours")
    private boolean isApiKeyInvalid() {
        return apiKey == null || apiKey.isEmpty() || "YOUR_ALPHA_VANTAGE_API_KEY".equals(apiKey);
    }
    public IntradayApiResponse getAfterHours(String symbol){
        if (isApiKeyInvalid()) {
            return new IntradayApiResponse();
        }
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(ALPHA_VANTAGE_BASE_URL)
                .queryParam("function", "TIME_SERIES_INTRADAY")
                .queryParam("symbol", symbol)
                .queryParam("interval", "5min")
                .queryParam("outputsize", "full")
                .queryParam("apikey", apiKey);
        try {
            IntradayApiResponse response;
            response = restTemplate.getForObject(uriBuilder.toUriString(), IntradayApiResponse.class);
            return response;
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching after hours data for " + symbol, e);
        }
        return null;
    }

    // market movers
    // don't use
    public MarketMoversApiResponse getMarketMovers() {

        if (isApiKeyInvalid()) {
            return new MarketMoversApiResponse();
        }

        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(ALPHA_VANTAGE_BASE_URL)
                .queryParam("function", "TOP_GAINERS_LOSERS")
                .queryParam("apikey", apiKey);


        try {
            MarketMoversApiResponse response;
            response = restTemplate.getForObject(uriBuilder.toUriString(), MarketMoversApiResponse.class);
            return response;
        } catch (HttpClientErrorException e) {
            LOGGER.log(Level.SEVERE, "HTTP Client Error while fetching market movers: " + e.getStatusCode() + " " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching market movers from Alpha Vantage", e);
        }

        // Return an empty or error-indicating object if the call fails
        return new MarketMoversApiResponse();
    }


    // get all the stock info
    public StockInfo getStockInfo(String symbol) {
        if (isApiKeyInvalid()) {
            return new StockInfo("API key not configured or missing.");
        }

        StockInfo stockInfo = new StockInfo();
        stockInfo.setSymbol(symbol.toUpperCase());

        // Fetch company name
        stockInfo.setName(fetchCompanyName(symbol));

        // Fetch quote data (price, changes, volume etc.) and populate the stockInfo object
        fetchQuoteData(symbol, stockInfo);

        if (stockInfo.getName() == null && stockInfo.getPrice() == null) {
            return new StockInfo("Could not fetch data for symbol: " + symbol);
        }

        if (stockInfo.getName() == null) stockInfo.setName("N/A (Name not found)");
        if (stockInfo.getPrice() == null) stockInfo.setPrice("N/A (Price not found)");

        return stockInfo;
    }
    // gets all stock data
    private void fetchQuoteData(String symbol, StockInfo stockInfo) {
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(ALPHA_VANTAGE_BASE_URL)
                .queryParam("function", "GLOBAL_QUOTE")
                .queryParam("symbol", symbol)
                .queryParam("apikey", apiKey);

        try {
            AlphaVantageQuoteApiResponse response = restTemplate.getForObject(uriBuilder.toUriString(), AlphaVantageQuoteApiResponse.class);
            if (response != null && response.getGlobalQuote() != null && response.getGlobalQuote().getSymbol() != null) {
                AlphaVantageGlobalQuote quote = response.getGlobalQuote();
                stockInfo.setOpen(quote.getOpen());
                stockInfo.setHigh(quote.getHigh());
                stockInfo.setLow(quote.getLow());
                stockInfo.setPrice(quote.getPrice());
                stockInfo.setVolume(quote.getVolume());
                stockInfo.setLatestTradingDay(quote.getLatestTradingDay());
                stockInfo.setPreviousClose(quote.getPreviousClose());
                stockInfo.setChange(quote.getChange());
                stockInfo.setChangePercentage(quote.getChangePercentage());
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching quote data for " + symbol, e);
        }
    }


    // only gets company name
    private String fetchCompanyName(String symbol) {
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(ALPHA_VANTAGE_BASE_URL)
                .queryParam("function", "SYMBOL_SEARCH")
                .queryParam("keywords", symbol)
                .queryParam("apikey", apiKey);
        try {
            AlphaVantageSearchApiResponse response = restTemplate.getForObject(uriBuilder.toUriString(), AlphaVantageSearchApiResponse.class);
            if (response != null && response.getBestMatches() != null && !response.getBestMatches().isEmpty()) {
                // Find an exact match for the symbol if possible
                for (AlphaVantageSymbolMatch match : response.getBestMatches()) {
                    if (symbol.equalsIgnoreCase(match.getSymbol())) {
                        return match.getName();
                    }
                }
                return response.getBestMatches().getFirst().getName(); // Fallback to the first best match
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching company name for " + symbol, e);
        }
        return null;
    }


}