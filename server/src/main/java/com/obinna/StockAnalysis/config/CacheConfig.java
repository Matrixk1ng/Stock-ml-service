package com.obinna.StockAnalysis.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;

import java.util.concurrent.TimeUnit;

@Configuration
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        // We are using a ConcurrentMapCacheManager, which is a simple in-memory cache.
        // For each cache name, we specify a TTL (Time-To-Live).
        return new ConcurrentMapCacheManager() {
            @Override
            @NonNull
            protected Cache createConcurrentMapCache(@NonNull String name) {
                // Default behavior is no expiration. We will define TTLs for specific caches.
                long ttl = -1;
                switch (name) {
                    case "companyNews":
                        ttl = 3 * 60;
                        break;
                    case "generalNews":
                        ttl = 6 * 60;
                        break;
                    case "screener":
                        ttl = 6 * 60;
                        break;
                    case "profile":
                        ttl = 720;
                        break;
                    case "finnhubQuotes":
                        // Cache for near real-time quotes. Expires after 1 minute.
                        ttl = 5;
                        break;
                    case "historicalChart":
                        // main stock view for present day view and 1D and 5D views
                        ttl = 5;
                        break;
                    case "quotes":
                        // Cache for individual stock quotes. Expires after 15 minutes.
                        // use for other things of the stock not necessarily the price.
                        ttl = 15;
                        break;
                    case "priceChanges":
                        ttl = 720;
                        break;
                    case "historicalDaily":
                        // Cache for price changes and daily historical data. Expires after 1 day.
                        // this is for 1M 6M and 1 year chart view
                        ttl = 720;
                        break;
                    case "marketLeaders":
                        // Cache for market leaders. Expires after 1 hour.
                        ttl = 15;
                        break;
                    case "allUsStocks":
                        // A long cache for the list of all US stocks, which doesn't change often. Expires after 12 hours.
                        ttl = 720; // 12 * 60
                        break;
                    case "afterHours":
                        ttl = 5;
                    default:
                        break;
                }

                if (ttl > 0) {
                    return new ConcurrentMapCache(
                            name,
                            Caffeine.newBuilder()
                                    .expireAfterWrite(ttl, TimeUnit.MINUTES)
                                    .build().asMap(),
                            true);
                }
                // If no TTL is matched, create a cache that does not expire.
                return super.createConcurrentMapCache(name);
            }
        };
    }
}
