package com.obinna.StockAnalysis.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "app_users") // This should match your Supabase user table name
@Getter
@Setter
public class User {
    @Id
    private UUID id; // This is the UUID from Supabase auth

    @Column(unique = true, nullable = false, columnDefinition = "text")
    private String email;

    @Column(columnDefinition = "text")
    private String name;
    
    @Column(columnDefinition = "text")
    private String provider;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private Instant createdAt;
    // Getters and Setters
}
