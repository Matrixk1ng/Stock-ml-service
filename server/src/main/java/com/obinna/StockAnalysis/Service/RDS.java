package com.obinna.StockAnalysis.Service;


import com.obinna.StockAnalysis.Repository.SignalRepository;
import com.obinna.StockAnalysis.models.Price;
import com.obinna.StockAnalysis.models.Signal;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.List;
import com.obinna.StockAnalysis.Repository.PriceRepository;


@Service
public class RDS {
    private final SignalRepository signalRepository;
    private final PriceRepository priceRepository;


    public RDS(SignalRepository signalRepository, PriceRepository priceRepository) {
        this.signalRepository = signalRepository;
        this.priceRepository = priceRepository;
    }

    public List<Signal> getMlSignals(String ticker, int limit) {
        ticker = ticker.toUpperCase();

        return signalRepository.findTopByTickerOrderBySignalDateDesc(ticker, PageRequest.of(0, limit));
    }

    public List<Price> getHistoricalChart(String symbol) {
        symbol = symbol.toUpperCase();

        return priceRepository.findByTickerOrderByPriceDateDesc(symbol);
    }
}
