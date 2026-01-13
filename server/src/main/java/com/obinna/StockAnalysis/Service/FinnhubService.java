package com.obinna.StockAnalysis.Service;

import com.obinna.StockAnalysis.dto.financial_modeling_prep.FinnhubQuote;
import com.obinna.StockAnalysis.dto.finnhub.CompanyNews;
import com.obinna.StockAnalysis.dto.finnhub.GeneralNews;
import com.obinna.StockAnalysis.dto.finnhub.UniversalStockList;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.util.UriComponentsBuilder;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class FinnhubService {

    private final RestTemplate restTemplate;
    private static final Logger LOGGER = Logger.getLogger(FinnhubService.class.getName());

    private final String apiKey;
    private final String FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

    public FinnhubService(RestTemplate restTemplate,
            @Value("${finnhub.api.key}") String apiKey) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
    }

    private boolean isApiKeyInvalid() {
        return apiKey == null || apiKey.isEmpty() || "YOUR_FINNHUB_API_KEY".equals(apiKey);
    }

    @Cacheable(value = "companyNews")
    public CompanyNews [] getCompanyNews(String symbol){
        if (isApiKeyInvalid()) {
            return new CompanyNews[0];
        }
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE; // This format is "YYYY-MM-DD"
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(7);

        String url = UriComponentsBuilder.fromUriString(FINNHUB_BASE_URL)
                .path("/company-news")
                .queryParam("symbol", symbol)
                // Add the 'from' date, formatted as a string
                .queryParam("from", sevenDaysAgo.format(formatter))
                // Add the 'to' date, formatted as a string
                .queryParam("to", today.format(formatter))
                .queryParam("token", apiKey)
                .toUriString();
        try {
            CompanyNews [] companyNews = restTemplate.getForObject(url, CompanyNews[].class);            
            System.out.println("EXECUTING Finnhub API CALL FOR getFinnhubQuote: ");
            return companyNews;
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE,"Error fetching quote from Finnhub for symbol: {}" + e);
        }

        return new CompanyNews[0];
    }


    @Cacheable(value = "generalNews")
    public GeneralNews [] getGeneralNews(){
        if (isApiKeyInvalid()) {
            return new GeneralNews[0];
        }
        String url = UriComponentsBuilder.fromUriString(FINNHUB_BASE_URL)
                .path("/news")
                .queryParam("category", "general")
                .queryParam("token", apiKey)
                .toUriString();
        try {
            GeneralNews [] generalNews = restTemplate.getForObject(url, GeneralNews[].class);            
            System.out.println("EXECUTING Finnhub API CALL FOR getFinnhubQuote: ");
            return generalNews;
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE,"Error fetching quote from Finnhub for symbol: {}" + e);
        }

        return new GeneralNews[0];
    }


    // get market summary
    
    @Cacheable(value = "finnhubQuotes", key = "#symbol")
    public FinnhubQuote getQuote(String symbol) {
        if (isApiKeyInvalid()) {
            return null;
        }
        LOGGER.log(Level.FINEST, "EXECUTING FINNHUB API CALL FOR QUOTE: {}", symbol);
        
        String url = UriComponentsBuilder.fromUriString(FINNHUB_BASE_URL)
                .path("/quote")
                .queryParam("symbol", symbol.toUpperCase())
                .queryParam("token", apiKey)
                .toUriString();
        
        try {
            FinnhubQuote quote = restTemplate.getForObject(url, FinnhubQuote.class);
            // Finnhub often returns a valid object with 0s for invalid symbols.
            if (quote != null && quote.getCurrentPrice() == 0 && quote.getPreviousClosePrice() == 0) {
                 LOGGER.log(Level.WARNING,"Finnhub returned a quote with all zero values for symbol: {}. It may be invalid.", symbol);
                 return null;
            }
            System.out.println("EXECUTING Finnhub API CALL FOR getFinnhubQuote: " + symbol);
            return quote;
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE,"Error fetching quote from Finnhub for symbol: {}", symbol + e);
            return null;
        }
    }

    // get universal stock listings
    @Cacheable("allUsStocks")
    public UniversalStockList[] getUniversalStockList() {
        System.out.println(apiKey + "FINNHUB KEY len=" + apiKey.length() + " starts=" + apiKey.substring(0, 6));

        if (isApiKeyInvalid()) {
            return new UniversalStockList[0];
        }

        String stockSymbolPath = FINNHUB_BASE_URL + "/stock/symbol";
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(stockSymbolPath)
                .queryParam("exchange", "US")
                .queryParam("token", apiKey); // <-- Finnhub uses "token"
        try {
            UniversalStockList[] response;
            response = restTemplate.getForObject(uriBuilder.toUriString(), UniversalStockList[].class);
            return response;
        } catch (HttpClientErrorException e) {
            LOGGER.log(Level.SEVERE, "HTTP Client Error while fetching Universal Listing: " + e.getStatusCode() + " "
                    + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching Universal Listing from Finnhub", e);
        }
        return new UniversalStockList[0];
    }

}
