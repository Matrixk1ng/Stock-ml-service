package com.obinna.StockAnalysis.dto.financial_modeling_prep;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FinnhubQuote {
     @JsonProperty("c")
    private double currentPrice;

    @JsonProperty("d")
    private double change;
    
    @JsonProperty("dp")
    private double percentChange;
    
    @JsonProperty("h")
    private double highPriceOfDay;
    
    @JsonProperty("l")
    private double lowPriceOfDay;
    
    @JsonProperty("o")
    private double openPriceOfDay;
    
    @JsonProperty("pc")
    private double previousClosePrice;
}
