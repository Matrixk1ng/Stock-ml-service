package com.obinna.StockAnalysis.models;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.domain.Persistable;
import java.time.LocalDate;

@Entity
@Table(name = "prices")
@IdClass(PriceId.class)
@Data
public class Price implements Persistable<PriceId> { // Specify the ID class here
    @Id
    @Column(name = "ticker")
    private String ticker;

    @Id
    @Column(name = "price_date")   // <-- ADD THIS
    private LocalDate priceDate;

    @Column(name = "open_price")
    private Double openPrice;

    @Column(name = "high_price")
    private Double highPrice;

    @Column(name = "low_price")
    private Double lowPrice;

    @Column(name = "close_price")
    private Double closePrice;

    @Column(name = "volume")
    private Long volume;


    @Transient
    private boolean isNew = true; // Default to true for new objects

    @Override
    public PriceId getId() {
        return new PriceId(ticker, priceDate);
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    // When Hibernate loads an existing record, mark it as NOT new
    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }
}