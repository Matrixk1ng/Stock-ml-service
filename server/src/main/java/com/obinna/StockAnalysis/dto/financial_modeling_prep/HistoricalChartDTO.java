package com.obinna.StockAnalysis.dto.financial_modeling_prep;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class HistoricalChartDTO {
    private String date;
    private Double open;
    private Double low;
    private Double high;
    private Double close;
    private Long volume;
    // You can add the extra FMP fields here if you decide to calculate/store them later
}