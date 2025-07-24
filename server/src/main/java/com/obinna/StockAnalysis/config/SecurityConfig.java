package com.obinna.StockAnalysis.config;

import com.obinna.StockAnalysis.security.OAuth2LoginSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    public SecurityConfig(OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler) {
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                // Permit access to the OAuth2 endpoints. This is the key change.
                .requestMatchers("/login/**", "/oauth2/**", "/api/portfolios/**").authenticated()
                // You can protect your data APIs later with JWT validation
                .anyRequest().permitAll() // For now, let's permit all other requests
            )
            .oauth2Login(oauth2 -> oauth2
                // Tell Spring Security to use your custom handler on success
                .successHandler(oAuth2LoginSuccessHandler)
            );

        return http.build();
    }
}