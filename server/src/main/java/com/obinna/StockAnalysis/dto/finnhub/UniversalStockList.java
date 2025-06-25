package com.obinna.StockAnalysis.dto.finnhub;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UniversalStockList {
    private String currency;
    private String description;
    private String displaySymbol;
    private String figi;
    private String isin;
    private String mic;
    private String shareClassFIGI;
    private String symbol;
    private String symbol2;
    private String type;
}
