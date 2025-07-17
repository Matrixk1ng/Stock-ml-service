package com.obinna.StockAnalysis.dto.financial_modeling_prep;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MarketLeader {
    private String symbol;
    private String price;
    private String name;
    private String change;
    private String changesPercentage;
    private String exchange;

    // Lombok generates getters and setters
}
