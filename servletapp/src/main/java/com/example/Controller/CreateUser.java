package com.example.Controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.UUID;

import com.example.Models.User;
import com.example.elasticsearch.ElasticSearchClientProvider;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/createUser")
public class CreateUser extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

        response.setContentType("application/json");
        ObjectMapper mapper = new ObjectMapper();

       try {
            // Get token from Authorization header
            String token = request.getHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7); // Remove "Bearer " prefix
            }

            // Parse request body into User object
            BufferedReader reader = request.getReader();
            User newUser = mapper.readValue(reader, User.class);

            // Generate a unique document ID
            String docId = UUID.randomUUID().toString();

            // Call controller method
            UserController.createUser(
                "users",
                docId,
                newUser,
                token,
                ElasticSearchClientProvider.getClient().esClient
            );

            response.setStatus(HttpServletResponse.SC_OK);
            mapper.writeValue(response.getWriter(), newUser);
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
