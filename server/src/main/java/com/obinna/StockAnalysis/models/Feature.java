package com.obinna.StockAnalysis.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "features")
public class Feature {
    @Id
    private String ticker;

    @Id
    private String feature_date;

    private Double log_return_1d;
    private Double log_return_7d;
    private Double log_return_14d;

    private Double vol_14d;
    private Double vol_30d;

    private Double drawdown_30d;
    private Double rsi_14;
    private Double volume_z_30d;

    private Double corr_60d;
    private Double beta_60d;
}
