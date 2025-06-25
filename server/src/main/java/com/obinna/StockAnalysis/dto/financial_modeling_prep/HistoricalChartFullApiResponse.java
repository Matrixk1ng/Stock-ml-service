package com.obinna.StockAnalysis.dto.financial_modeling_prep;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
public class HistoricalChartFullApiResponse {
    private String symbol;
    private List<HistoricalChart> historical;
}
