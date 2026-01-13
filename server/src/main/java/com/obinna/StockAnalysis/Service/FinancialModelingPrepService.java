package com.obinna.StockAnalysis.Service;

import com.obinna.StockAnalysis.Repository.PriceIngestionRepository;
import com.obinna.StockAnalysis.dto.financial_modeling_prep.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class FinancialModelingPrepService {
    private final String FMP_BASE_URL = "https://financialmodelingprep.com/stable/";
    private static final Logger LOGGER = Logger.getLogger(FinancialModelingPrepService.class.getName());
    private static final List<String> SECTORS = List.of(
            "Technology",
            "Healthcare",
            "Financial Services",
            "Consumer Cyclical",
            "Energy",
            "Industrials",
            "Real Estate",
            "Utilities",
            "Basic Materials",
            "Communication Services",
            "Consumer Defensive");

    private final RestTemplate restTemplate;

    private final String apiKey;

    @Autowired
    private PriceIngestionRepository ingestionRepo;

    public FinancialModelingPrepService(RestTemplate restTemplate, @Value("${FMP.api.key}") String apiKey) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
    }

    private boolean isApiKeyInvalid() {
        return apiKey == null || apiKey.isEmpty() || "YOUR_FMP_API_KEY".equals(apiKey);
    }

    @Cacheable(value = "sector")
    public SectorPerformance[] getSectorPerformance() {
        List<SectorPerformance> results = new ArrayList<>();
        if (isApiKeyInvalid()) {
            LOGGER.warning("FMP API Key is invalid or not configured.");
            return new SectorPerformance[0];
        }

        String screenerPath = FMP_BASE_URL + "historical-sector-performance";
        String today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        for (String sector : SECTORS) {
            String encodedSector = URLEncoder.encode(sector, StandardCharsets.UTF_8);
            UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(screenerPath)
                    .queryParam("sector", encodedSector)
                    .queryParam("from", today)
                    .queryParam("to", today)
                    .queryParam("apikey", apiKey);
            try {
                SectorPerformance[] response;
                response = restTemplate.getForObject(uriBuilder.toUriString(), SectorPerformance[].class);
                if (response != null && response.length > 0) {
                    results.add(response[0]); // one per sector
                }

            } catch (HttpClientErrorException e) {
                LOGGER.log(Level.SEVERE, "HTTP Client Error fetching sector performance " + e.getStatusCode(), e);
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, "Error fetching sector performance from FMP", e);
            }
        }
        return results.toArray(new SectorPerformance[0]);
    }

    @Cacheable(value = "screener")
    public Screener[] getStockScreener() {
        if (isApiKeyInvalid()) {
            LOGGER.warning("FMP API Key is invalid or not configured.");
            return new Screener[0];
        }

        String screenerPath = FMP_BASE_URL + "company-screener";
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(screenerPath)
                .queryParam("country", "US")
                .queryParam("isEtf", false)
                .queryParam("isFund", false)
                .queryParam("isActivelyTrading", true)
                .queryParam("apikey", apiKey);
        try {
            Screener[] response;
            response = restTemplate.getForObject(uriBuilder.toUriString(), Screener[].class);
            for (Screener screener : response) {
                String symbol = screener.getSymbol().toUpperCase();
                ingestionRepo.upsertStock(
                        symbol,
                        screener.getCompanyName(),
                        screener.getSector(),
                        screener.getIndustry(),
                        screener.getMarketCap());

                LOGGER.info("Seeded stock metadata for: " + symbol);
            }
            return response;
        } catch (HttpClientErrorException e) {
            LOGGER.log(Level.SEVERE, "HTTP Client Error fetching Stock Screener " + e.getStatusCode(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching Stock Screener from FMP", e);
        }
        return new Screener[0];
    }

    @Cacheable(value = "profile", key = "#symbol")
    public CompanyProfile[] getCompanyProfile(String symbol) {
        if (isApiKeyInvalid()) {
            LOGGER.warning("FMP API Key is invalid or not configured.");
            return null;
        }
        String profilePath = FMP_BASE_URL + "profile";
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(profilePath)
                .queryParam("symbol", symbol)
                .queryParam("apikey", apiKey);
        System.out.println("url: " + uriBuilder);
        try {
            CompanyProfile[] response = restTemplate.getForObject(uriBuilder.toUriString(), CompanyProfile[].class);
            if (response != null) {
                return response; // <-- This is the successful return
            }
        } catch (HttpClientErrorException e) {
            LOGGER.log(Level.SEVERE,
                    "HTTP Client Error fetching Company Profile for " + symbol + ": " + e.getStatusCode(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching Company Profile for " + symbol + " from FMP", e);
        }
        return null;
    }

    @Cacheable(value = "priceChanges", key = "#symbol")
    public PriceChange getPriceChange(String symbol) {
        if (isApiKeyInvalid()) {
            LOGGER.warning("FMP API Key is invalid or not configured.");
            return null;
        }
        // Build the specific path for this endpoint
        String historicalDataPath = FMP_BASE_URL + "stock-price-change";

        // Build the full URL with the API key
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(historicalDataPath)
                .queryParam("symbol", symbol)
                .queryParam("apikey", apiKey);
        try {
            // Make the API call and map the response to your wrapper class
            PriceChange[] response;
            response = restTemplate.getForObject(uriBuilder.toUriString(), PriceChange[].class);
            if (response != null && response.length > 0) {
                return response[0]; // <-- This is the successful return
            }

        } catch (HttpClientErrorException e) {
            LOGGER.log(Level.SEVERE,
                    "HTTP Client Error fetching historical data for " + symbol + ": " + e.getStatusCode(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching historical data for " + symbol + " from FMP", e);
        }

        return null;
    }

    // 1M", "6M", "1Y" Chart Views
    public HistoricalChart[] getHistoricalDailyChart(String symbol) {
        // Return null if the API key is missing
        if (isApiKeyInvalid()) {
            LOGGER.warning("FMP API Key is invalid or not configured.");
            return new HistoricalChart[0];
        }
        syncStockMetadata(symbol);

        String today = LocalDate.now().toString();
        // Build the specific path for this endpoint
        String historicalDataPath = FMP_BASE_URL + "historical-price-eod/full";

        // Build the full URL with the API key
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(historicalDataPath)
                .queryParam("symbol", symbol)
                // .queryParam("from", today)
                // .queryParam("to", today)
                .queryParam("apikey", apiKey);

        try {
            // Make the API call and map the response to your wrapper class
            HistoricalChart[] response;
            response = restTemplate.getForObject(uriBuilder.toUriString(), HistoricalChart[].class);
            // ObjectMapper mapper = new ObjectMapper();
            // System.out.println("EXECUTING FMP API CALL FOR getHistoricalFullChart:\n" +
            // mapper.writerWithDefaultPrettyPrinter().writeValueAsString(response));
            if (response != null && response.length > 0) {
                saveToDatabase(symbol, response);
            }
            return response != null ? response : new HistoricalChart[0];

        } catch (HttpClientErrorException e) {
            LOGGER.log(Level.SEVERE,
                    "HTTP Client Error fetching historical data for " + symbol + ": " + e.getStatusCode(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching historical data for " + symbol + " from FMP", e);
        }

        // Return null if there was any kind of error
        return new HistoricalChart[0];
    }

    private void syncStockMetadata(String symbol) {
        // Fetch profile from FMP
        ingestionRepo.ensureStockRowExists(symbol);
        var meta = ingestionRepo.getStockMeta(symbol);
        Instant now = Instant.now();

        boolean missingCore = (meta == null)
                || meta.sector() == null
                || meta.industry() == null;

        boolean stale = (meta == null)
                || meta.lastMetadataRefresh() == null
                || meta.lastMetadataRefresh().isBefore(now.minus(7, ChronoUnit.DAYS));

        if (!(missingCore || stale)) {
            return; // ✅ skip API call entirely
        }
        CompanyProfile[] profile = getCompanyProfile(symbol);

        if (profile != null) {
            // High performance upsert using JdbcTemplate
            ingestionRepo.upsertStock(
                    symbol,
                    profile[0].getCompanyName(),
                    profile[0].getSector(),
                    profile[0].getIndustry(),
                    profile[0].getMarketCap());
            LOGGER.info("Metadata synced for " + symbol);
        } else {
            // If profile fetch fails, insert a shell record so prices don't crash
            ingestionRepo.upsertStock(symbol, null, null, null, null);
        }
    }

    // save to RDS
    private void saveToDatabase(String symbol, HistoricalChart[] charts) {

        List<PriceIngestionRepository.PriceRow> rows = Arrays.stream(charts)
                .map(c -> new PriceIngestionRepository.PriceRow(
                        symbol,
                        LocalDate.parse(c.getDate()),
                        Double.parseDouble(c.getOpen()),
                        Double.parseDouble(c.getHigh()),
                        Double.parseDouble(c.getLow()),
                        Double.parseDouble(c.getClose()),
                        Long.parseLong(c.getVolume())))
                .toList();

        if (!rows.isEmpty()) {
            ingestionRepo.batchInsertIgnore(rows);
            LOGGER.info("Saved batch for " + symbol + " (" + rows.size() + " rows)");
        }
    }

    @Cacheable(value = "historicalChart", key = "#symbol")
    public HistoricalChart[] getHistoricalChart(String symbol) {
        if (isApiKeyInvalid()) {
            return new HistoricalChart[0];
        }
        String stockSymbol = FMP_BASE_URL + "historical-chart/5min";
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(stockSymbol)
                .queryParam("symbol", symbol)
                .queryParam("apikey", apiKey);
        try {
            HistoricalChart[] response;
            response = restTemplate.getForObject(uriBuilder.toUriString(), HistoricalChart[].class);
            System.out.println("EXECUTING FMP API CALL FOR getHistoricalChart: " + symbol);
            return response;
        } catch (HttpClientErrorException e) {
            LOGGER.log(Level.SEVERE, "HTTP Client Error while fetching " + symbol + ": " + e.getStatusCode() + " "
                    + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching " + symbol + " stock from Financial Modeling Prep", e);
        }

        return new HistoricalChart[0];
    }

    //@Cacheable(value = "quotes", key = "#symbol")
    public StockQuote getStockQuote(String symbol) {
        if (isApiKeyInvalid()) {
            return new StockQuote();
        }
        String stockSymbol = FMP_BASE_URL + "quote";
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(stockSymbol)
                .queryParam("symbol", symbol)
                .queryParam("apikey", apiKey);
        try {
            StockQuote[] response;
            response = restTemplate.getForObject(uriBuilder.toUriString(), StockQuote[].class);
            System.out.println("EXECUTING FMP API CALL FOR getStockQuote: " + symbol);
            if (response != null && response.length > 0) {
                return response[0]; // <-- This is the successful return
            }
        } catch (HttpClientErrorException e) {
            LOGGER.log(Level.SEVERE, "HTTP Client Error while fetching " + symbol + ": " + e.getStatusCode() + " "
                    + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching " + symbol + " stock from Financial Modeling Prep", e);
        }
        return new StockQuote();
    }

    @Cacheable(value = "marketLeaders", key = "#leaderType")
    public MarketLeader[] getMarketLeader(String leaderType) {
        if (isApiKeyInvalid()) {
            return new MarketLeader[0];
        }
        String marketLeadersPath = FMP_BASE_URL + leaderType;
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(marketLeadersPath)
                .queryParam("apikey", apiKey);
        try {
            // The rest of your logic to call the API...
            MarketLeader[] response;
            response = restTemplate.getForObject(uriBuilder.toUriString(), MarketLeader[].class);
            return response;
        } catch (HttpClientErrorException e) {
            LOGGER.log(Level.SEVERE, "HTTP Client Error while fetching top" + leaderType + ": " + e.getStatusCode()
                    + " " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching " + leaderType + " Universal Listing from Financial Modeling Prep",
                    e);
        }
        return new MarketLeader[0];
    }

    // To get and ingest historical into AWS RDS

}
