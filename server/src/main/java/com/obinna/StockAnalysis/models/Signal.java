package com.obinna.StockAnalysis.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "ml_signals")
@IdClass(MlSignalId.class)
@Data
public class Signal {

    @Id
    private String ticker;

    @Id
    @Column(name = "signal_date")
    private LocalDate signalDate;

    @Column(name = "regime_label")
    private String regimeLabel;

    @Column(name = "risk_score")
    private Integer riskScore;

    // simplest: store raw JSON text
    @Column(name = "drivers_json", columnDefinition = "jsonb")
    private String driversJson;
}



