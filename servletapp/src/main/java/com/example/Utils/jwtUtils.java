package com.example.Utils;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;

import java.util.Date;

public class jwtUtils {
    private static final String SECRET = "your-256-bit-secret"; // store securely
    private static final Algorithm ALGORITHM = Algorithm.HMAC256(SECRET);
    private static final long EXPIRATION_TIME = 1000 * 60 * 60; // 1 minute

    public static String generateToken(String userEmail) {
        return JWT.create()
                .withSubject(userEmail)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .sign(ALGORITHM);
    }

    public static String verifyToken(String token) {
        JWTVerifier verifier = JWT.require(ALGORITHM).build();
        DecodedJWT jwt = verifier.verify(token);
        return jwt.getSubject(); // returns userEmail
    }
}
