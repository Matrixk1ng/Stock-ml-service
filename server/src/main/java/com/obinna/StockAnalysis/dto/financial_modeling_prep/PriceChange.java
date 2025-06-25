package com.obinna.StockAnalysis.dto.financial_modeling_prep;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PriceChange {
    private String symbol;
    @JsonProperty("1D")
    private String oneDay;
    @JsonProperty("5D")
    private String fiveDays;
    @JsonProperty("1M")
    private String oneMonth;
    @JsonProperty("3M")
    private String threeMonths;
    @JsonProperty("6M")
    private String sixMonths;
    private String YTD;
    @JsonProperty("1Y")
    private String oneYear;
    @JsonProperty("3Y")
    private String twoYears;
    @JsonProperty("5Y")
    private String threeYears;
    @JsonProperty("10Y")
    private String tenYears;
    private String max;
}
