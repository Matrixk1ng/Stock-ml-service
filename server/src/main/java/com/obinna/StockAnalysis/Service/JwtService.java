package com.obinna.StockAnalysis.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {
  @Value("${jwt.secret}")
  private String secret;

  @Value("${jwt.expiration-ms}")
  private long expirationMs;

  public String createToken(String email, String name) {
    Date now = new Date();
    Key key = Keys.hmacShaKeyFor(secret.getBytes());

    return Jwts.builder()
      .subject(email)
      .claim("name", name)
      .issuedAt(now)
      .expiration(new Date(now.getTime() + expirationMs))
      .signWith(key) 
      .compact();
  }
}
