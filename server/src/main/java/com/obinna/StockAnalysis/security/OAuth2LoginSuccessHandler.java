// This class runs after a successful Google login.
package com.obinna.StockAnalysis.security;

import com.obinna.StockAnalysis.Service.JwtService;
import com.obinna.StockAnalysis.Service.SupabaseService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final SupabaseService supabaseService;
    private final JwtService jwtService;
    private final String frontendSuccessUri;

    public OAuth2LoginSuccessHandler(SupabaseService supabaseService,JwtService jwtService, @Value("${frontend.success-uri}") String frontendSuccessUri) {
        this.supabaseService = supabaseService;
        this.jwtService = jwtService;
        this.frontendSuccessUri = frontendSuccessUri;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String id       = oAuth2User.getName();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String provider = authentication.getAuthorities().toString();
        supabaseService.upsertUser(id, email, name, provider);
        // Here you would also sync the user with your database
        // userService.syncUser(oAuth2User.getName(), email);

        // Create your custom JWT
        String jwt = jwtService.createToken(email, name);

        // Redirect back to the frontend with the token
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendSuccessUri)
                .queryParam("token", URLEncoder.encode(jwt, StandardCharsets.UTF_8))
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}