package com.obinna.StockAnalysis.dto.financial_modeling_prep;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SectorPerformance {
    private String date;
    private String sector;
    private String averageChange;
}
