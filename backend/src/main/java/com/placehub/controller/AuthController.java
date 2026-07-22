package com.placehub.controller;

import com.placehub.dto.request.LoginRequest;
import com.placehub.dto.request.RegisterRequest;
import com.placehub.dto.response.AuthResponse;
import com.placehub.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    private final AuthService authService;
    private final com.placehub.security.JwtService jwtService;
    private final com.placehub.security.CustomUserDetailsService customUserDetailsService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return new ResponseEntity<>(authService.registerStudent(request), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/debug-token")
    public ResponseEntity<java.util.Map<String, Object>> debugToken(@RequestBody java.util.Map<String, String> body) {
        String token = body.get("token");
        java.util.Map<String, Object> debugInfo = new java.util.HashMap<>();
        debugInfo.put("token", token);
        try {
            boolean valid = jwtService.isTokenValid(token);
            debugInfo.put("valid", valid);
            String email = jwtService.extractEmail(token);
            debugInfo.put("email", email);
            
            // Debug loadUserByUsername
            try {
                org.springframework.security.core.userdetails.UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
                debugInfo.put("userDetailsName", userDetails.getUsername());
                debugInfo.put("userDetailsAuthorities", userDetails.getAuthorities().toString());
            } catch (Exception e) {
                debugInfo.put("userDetailsError", e.getMessage());
                java.io.StringWriter sw = new java.io.StringWriter();
                java.io.PrintWriter pw = new java.io.PrintWriter(sw);
                e.printStackTrace(pw);
                debugInfo.put("userDetailsStacktrace", sw.toString());
            }
        } catch (Exception e) {
            debugInfo.put("error", e.getMessage());
            java.io.StringWriter sw = new java.io.StringWriter();
            java.io.PrintWriter pw = new java.io.PrintWriter(sw);
            e.printStackTrace(pw);
            debugInfo.put("stacktrace", sw.toString());
        }
        return ResponseEntity.ok(debugInfo);
    }
}
