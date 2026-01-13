package com.obinna.StockAnalysis.models;

import java.time.Instant;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "stocks")
@Data
public class Stock {

    @Id
    @Column(name = "ticker", length = 10, nullable = false)
    private String ticker;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "sector")
    private String sector;

    @Column(name = "industry")
    private String industry;

    @Column(name = "market_cap")
    private Long marketCap;

    // Optional but recommended if you track refresh times
     @Column(name = "last_metadata_refresh")
     private Instant lastMetadataRefresh;

     @Column(name = "market_cap_updated_at")
     private Instant marketCapUpdatedAt;
}
