package com.obinna.StockAnalysis.dto.alpha_vantage;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class IntradayApiResponse {

    @JsonProperty("Meta Data")
    private IntradayMetaData metaData;

    // We use a Map because the keys are dynamic timestamps (e.g., "2025-06-18 19:55:00")
    // The key of the map will be the timestamp string, and the value will be the data point object.
    @JsonProperty("Time Series (5min)")
    private Map<String, IntradayDataPoint> timeSeries;
}