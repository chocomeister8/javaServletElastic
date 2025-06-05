package com.example.Controller;

import java.io.IOException;

import com.example.elasticsearch.ElasticSearchClientProvider;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.HashMap;

import jakarta.servlet.http.Cookie;


@WebServlet("/login")
public class LoginServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

    ObjectMapper mapper = new ObjectMapper();
    LoginRequest loginRequest = mapper.readValue(request.getReader(), LoginRequest.class);

    try {
        ElasticsearchClient client = ElasticSearchClientProvider.getClient().esClient;
        String token = UserController.login("users", loginRequest.getEmail(), loginRequest.getPassword(), client);

        // Create cookie for token
        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true); // secure the cookie
        cookie.setPath("/");
        // cookie.setSecure(true); // uncomment if using HTTPS
        response.addCookie(cookie);

        // Send success response
        Map<String, String> result = new HashMap<>();
        result.put("message", "Login successful");
        response.setContentType("application/json");
        mapper.writeValue(response.getWriter(), result);
        
    } catch (Exception e) {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + e.getMessage() + "\"}");
    }
}

    static class LoginRequest {
        public String email;
        public String password;

        public String getEmail() { return email; }
        public String getPassword() { return password; }
    }
}


