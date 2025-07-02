package com.obinna.StockAnalysis.dto.financial_modeling_prep;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Screener {
    private String symbol;
    private String companyName; 
    private long marketCap;
    private String sector;
    private String industry;
    private double beta;
    private double price;
    private int volume;
    private String exchange;
    private String exchangeShortName;
    private String country;
    private boolean isEtf;
    private boolean isFund;
    private boolean isActivelyTrading;

}
