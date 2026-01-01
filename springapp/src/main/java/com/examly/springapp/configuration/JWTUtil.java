// package com.examly.springapp.configuration;

// import java.security.Key;
// import java.util.Date;

// import io.jsonwebtoken.Jwts;
// import io.jsonwebtoken.SignatureAlgorithm;
// import io.jsonwebtoken.security.Keys;

// public class JWTUtil {
//     private static final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

//     public static String generateToken(String username) {
//         return Jwts.builder()
//                 .setSubject(username)
//                 .setIssuer("K")
//                 .setIssuedAt(new Date())
//                 .setExpiration(new Date(System.currentTimeMillis() + 60 * 60 * 1000))
//                 .signWith(key)
//                 .compact();
//     }
// }