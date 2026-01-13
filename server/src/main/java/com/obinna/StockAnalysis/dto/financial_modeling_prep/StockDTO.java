package com.obinna.StockAnalysis.dto.financial_modeling_prep;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockDTO {
    
    private String ticker;

    private String companyName;

    private String sector;

    private String industry;

    private Long marketCap;

    //  private Instant lastMetadataRefresh;

    //  private Instant marketCapUpdatedAt;
}
