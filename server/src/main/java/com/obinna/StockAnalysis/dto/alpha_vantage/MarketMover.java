package com.obinna.StockAnalysis.dto.alpha_vantage;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MarketMover {
    private String ticker;
    private String price;
    @JsonProperty("change_amount")
    private String changeAmount;
    @JsonProperty("change_percentage")
    private String changePercentage;
    private String volume;

    // Add Getters and Setters for all fields
}
