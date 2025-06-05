package com.example.Controller;

import java.io.IOException;
import java.util.List;

import com.example.elasticsearch.ElasticSearchClientProvider;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.example.Models.User;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebServlet("/users")
public class GetAllUsers extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

        try {
        List<User> users = UserController.retrieveAllUsers("users", ElasticSearchClientProvider.getClient().esClient);
            response.setContentType("application/json");
            new ObjectMapper().writeValue(response.getWriter(), users);
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
