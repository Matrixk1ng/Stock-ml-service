package com.obinna.StockAnalysis.models;

import lombok.*;
import java.io.Serializable;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class MlSignalId implements Serializable {
    private String ticker;
    private LocalDate signalDate;
}

