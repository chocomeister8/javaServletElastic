package com.example.controller;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import com.example.models.User;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.http.HttpHost;                    // Correct HttpHost for ES RestClient
import org.elasticsearch.client.RestClient;
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.IndexRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/api/createUser") 
public class CreateUser extends HttpServlet {
    private ElasticsearchClient client;
    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void init() throws ServletException {
        // Create low-level REST client
        RestClient restClient = RestClient.builder(new HttpHost("localhost", 9200, "http")).build();

        // Create transport with Jackson mapper
        ElasticsearchTransport transport = new RestClientTransport(restClient, new JacksonJsonpMapper());

        // Create high-level Elasticsearch client
        client = new ElasticsearchClient(transport);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setContentType("application/json");

        User user = mapper.readValue(req.getReader(), User.class);

        IndexRequest<User> request = IndexRequest.of(i -> i
            .index("users")
            .document(user)
        );

        client.index(request);
        resp.setStatus(HttpServletResponse.SC_OK);
        resp.getWriter().write("{\"message\": \"User created successfully\"}");
    }
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setContentType("application/json");

        // Sample query: return 10 users from index "users"
        SearchResponse<User> searchResponse = client.search(s -> s
            .index("users")
            .size(10), User.class);

        List<User> users = searchResponse.hits().hits().stream()
            .map(hit -> hit.source())
            .collect(Collectors.toList());

        String json = mapper.writeValueAsString(users);
        resp.getWriter().write(json);
    }
}
