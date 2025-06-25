package com.obinna.StockAnalysis.dto.financial_modeling_prep;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HistoricalChart {
    private String date;
    private String open;
    private String low;
    private String high;
    private String close;
    private String volume;

    // --- New fields from historical-price-full ---
    private String adjClose;
    private String unadjustedVolume;
    private String change;
    private String changePercent;
    private String vwap;
    private String label;
    private String changeOverTime;
}
