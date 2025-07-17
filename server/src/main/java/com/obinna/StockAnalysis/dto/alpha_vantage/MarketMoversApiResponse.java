package com.obinna.StockAnalysis.dto.alpha_vantage;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class MarketMoversApiResponse {
    private String metadata;
    @JsonProperty("last_updated")
    private String lastUpdated;
    @JsonProperty("top_gainers")
    private List<MarketMover> topGainers;
    @JsonProperty("top_losers")
    private List<MarketMover> topLosers;
    @JsonProperty("most_actively_traded")
    private List<MarketMover> mostActivelyTraded;

    // Lombok generates getters and setters
}
