package com.obinna.StockAnalysis.dto.finnhub;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GeneralNews {
    private String category;
    private long datetime;
    private String headline;
    private long id;
    private String image;
    private String related;
    private String source;
    private String summary;
    private String url;
}
