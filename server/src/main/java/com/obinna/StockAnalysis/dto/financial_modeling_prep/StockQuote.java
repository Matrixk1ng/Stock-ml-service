package com.obinna.StockAnalysis.dto.financial_modeling_prep;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockQuote {

    @Getter
    @Setter
    private String symbol;
    private String name;
    private String price;
    private String change;
    private String changePercentage;
    private String dayLow;
    private String dayHigh;
    private String yearHigh;
    private String yearLow;
    private String marketCap;
    private String priceAvg50;
    private String priceAvg200;
    private String exchange;
    private String volume;
    private String avgVolume;
    private String open;
    private String previousClose;
    private String eps;
    private String pe;
    private String earningsAnnouncement;
    private String sharesOutstanding;
    private String timestamp;


}
