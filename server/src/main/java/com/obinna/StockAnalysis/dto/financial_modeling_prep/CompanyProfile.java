package com.obinna.StockAnalysis.dto.financial_modeling_prep;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyProfile {
    private String symbol;
    private Double price;
    private Double beta;
    private Long averageVolume;
    private Long marketCap;
    private Double lastDividend;
    private String range;
    private Double changes;

    private String companyName;
    private String industry;
    private String sector;

    // keep the rest as String/Boolean as you have
    private String website;
    private String description;
    private String ceo;
    private String country;
    private String fullTimeEmployees;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String zip;

    private Double dcfDiff;
    private Double dcf;

    private String image;
    private String ipoDate;
    private Boolean defaultImage;
    private Boolean isEtf;
    private Boolean isActivelyTrading;
    private Boolean isAdr;
    private Boolean isFund;
}

