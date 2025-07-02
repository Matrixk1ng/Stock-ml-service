package com.obinna.StockAnalysis.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.obinna.StockAnalysis.Service.FinnhubService;
import com.obinna.StockAnalysis.dto.finnhub.CompanyNews;
import com.obinna.StockAnalysis.dto.finnhub.GeneralNews;

@RestController
@RequestMapping("/api/news")
public class NewsController {
    private final FinnhubService finnhubService;

    public NewsController(FinnhubService finnhubService) {
        this.finnhubService = finnhubService;
    }

    @GetMapping("/general-news")
    public ResponseEntity <GeneralNews[]> getGeneralNews(){
        GeneralNews[] generalNews = finnhubService.getGeneralNews();
        if(generalNews.length == 0){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(generalNews);
    } 

    @GetMapping("/company-news/{symbol}")
    public ResponseEntity <CompanyNews[]> getCompanyNews(@PathVariable String symbol){
        CompanyNews[] companyNews = finnhubService.getCompanyNews(symbol);
        if(companyNews.length == 0){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(companyNews);
    } 
    

}
