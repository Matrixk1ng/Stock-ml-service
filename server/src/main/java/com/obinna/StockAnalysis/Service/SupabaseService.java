package com.obinna.StockAnalysis.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class SupabaseService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String restUrl;
    private final String apiKey;

    public SupabaseService(
            @Value("${supabase.url}") String supabaseUrl,
            @Value("${supabase.key}") String supabaseKey) {
        this.restUrl = supabaseUrl + "/rest/v1/user";
        this.apiKey = supabaseKey;
    }

    /**
     * Upsert a user record into your public.users table.
     * Assumes you have a `users(id UUID PRIMARY KEY, email text, name text,
     * provider text)` schema.
     */
    public void upsertUser(String id, String email, String name, String provider) {
        String googleId = id; // e.g. "110017930302899779522"
        UUID userUuid = UUID.nameUUIDFromBytes(
                googleId.getBytes(StandardCharsets.UTF_8));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", apiKey);
        headers.set("Authorization", "Bearer " + apiKey);
        // "merge-duplicates" will do an UPSERT on your unique PK or unique constraint
        headers.set("Prefer", "resolution=merge-duplicates");

        Map<String, Object> body = new HashMap<>();
        body.put("id", userUuid.toString());
        body.put("email", email);
        body.put("name", name);
        body.put("provider", provider);

        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
        restTemplate.postForEntity(restUrl, req, String.class);
    }
}
