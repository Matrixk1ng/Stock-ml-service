package com.obinna.StockAnalysis.dto.alpha_vantage;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

// This DTO maps the overall structure for the SYMBOL_SEARCH endpoint
@Getter
@Setter
public class AlphaVantageSearchApiResponse {
    @Getter
    @Setter
    @JsonProperty("bestMatches")
    private List<AlphaVantageSymbolMatch> bestMatches;

    @JsonProperty("Error Message")
    private String errorMessage;

    @JsonProperty("Information")
    private String information;



    // Lombok generates getters and setters

}