package com.obinna.StockAnalysis;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockInfo {
    @Getter
    @Setter
    private String symbol;
    private String name;
    private String open;
    private String high;
    private String low;
    private String price;
    private String volume;
    private String latestTradingDay;
    private String previousClose;
    private String change;
    private String changePercentage;
    private String errorMessage; // To convey errors if any

    // Constructors
    public StockInfo() {
    }

    public StockInfo(String symbol, String name, String price) {
    }

    public StockInfo(String errorMessage) {
        this.errorMessage = errorMessage;
    }


}
