package com.obinna.StockAnalysis.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
public class PriceId implements Serializable {

    @Column(name = "ticker", length = 10, nullable = false)
    private String ticker;

    @Column(name = "price_date", nullable = false)
    private LocalDate priceDate;
}

