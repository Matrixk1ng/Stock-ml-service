package com.obinna.StockAnalysis.dto.alpha_vantage;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

// This DTO maps the overall structure for the GLOBAL_QUOTE endpoint

@Getter
@Setter
public class AlphaVantageQuoteApiResponse {

    @Getter
    @Setter
    @JsonProperty("Global Quote")
    private AlphaVantageGlobalQuote globalQuote;

    @JsonProperty("Error Message")
    private String errorMessage; // Captures API errors from Alpha Vantage

    @JsonProperty("Information")
    private String information; // Captures rate limit messages

    // Getters and Setters

}
