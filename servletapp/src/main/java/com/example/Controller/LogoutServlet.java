package com.example.Controller;

import java.io.IOException;

import com.example.elasticsearch.ElasticSearchClientProvider;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import jakarta.servlet.http.Cookie;

import com.example.Utils.jwtUtils;

@WebServlet("/logout")
public class LogoutServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    System.out.println("LogoutServlet: Received POST request");
    response.getWriter().write("Use POST instead.");

        // Get token from cookies
        String token = null;
        for (Cookie cookie : request.getCookies()) {
            if (cookie.getName().equals("token")) {
                token = cookie.getValue();
                break;
            }
        }

        if (token != null && !token.isEmpty()) {
            try {
                // Extract email from token (assuming JWT format)
                String email = jwtUtils.generateToken(token);

                // Get Elasticsearch client
                ElasticsearchClient client = ElasticSearchClientProvider.getClient().esClient;

                // Call logout logic
                UserController.logout("users", email, client);

            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // Clear the cookie by setting maxAge to 0
        Cookie cookie = new Cookie("token", "");
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0); // deletes the cookie
        // cookie.setSecure(true); // if using HTTPS
        response.addCookie(cookie);

        // Optionally, add CORS headers if you need them
        response.setContentType("application/json");
        response.getWriter().write("{\"message\":\"Logged out successfully\"}");
    }
}
