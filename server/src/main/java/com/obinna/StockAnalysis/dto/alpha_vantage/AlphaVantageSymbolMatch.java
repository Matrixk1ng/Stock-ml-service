package com.obinna.StockAnalysis.dto.alpha_vantage;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

// This DTO maps a single search result item from Alpha Vantage
@Getter
@Setter
public class AlphaVantageSymbolMatch {
    @Getter
    @Setter
    @JsonProperty("1. symbol")
    private String symbol;

    @JsonProperty("2. name")
    private String name;


}
