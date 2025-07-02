package com.obinna.StockAnalysis.dto.financial_modeling_prep;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyProfile {
    private String symbol;
    private int price;
    private int beta;
    private int volAvg;
    private long mktCap;
    private int lasDiv;
    private String range;
    private int changes;
    private String companyName;
    private String currency;
    private String cik;
    private String isin;
    private String cusip;
    private String exchange;
    private String exchangeShortName;
    private String industry;
    private String website;
    private String description;
    private String ceo;
    private String sector;
    private String country;
    private String fullTimeEmployees;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String zip;
    private int dcfDiff;
    private int dcf;
    private String image;
    private String ipoDate;
    private Boolean defaultImage;
    private Boolean isEtf;
    private Boolean isActivelyTrading;
    private Boolean isAdr;
    private Boolean isFund;
}
