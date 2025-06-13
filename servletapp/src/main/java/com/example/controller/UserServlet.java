package com.example.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.example.models.User;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.http.HttpHost;// Correct HttpHost for ES RestClient
import org.elasticsearch.client.RestClient;
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.Refresh;
import co.elastic.clients.elasticsearch.core.IndexRequest;
import co.elastic.clients.elasticsearch.core.IndexResponse;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import co.elastic.clients.elasticsearch._types.Refresh;


import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/api/users") 
public class UserServlet extends HttpServlet {
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
        try {
            BufferedReader reader = req.getReader();
            String json = reader.lines().collect(Collectors.joining());
            System.out.println("Received JSON: " + json);

            // Read user from the captured JSON string
            User user = mapper.readValue(json, User.class);

        // Validate fields
        if (!user.getName().matches("^[a-z ]+$")) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Name must contain only lowercase alphabets and spaces.\"}");
            return;
        }

        if (!user.getPassword().matches("^(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).{8,12}$")) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Password must be 8-12 characters and include at least one special character.\"}");
            return;
        }

        if (!user.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Invalid email format.\"}");
            return;
        }

        if (!isAtLeast18YearsOld(user.getDateOfBirth())) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"User must be at least 18 years old.\"}");
            return;
        }

        // Optional: Check for null in required fields
        if (user.getName() == null || user.getPassword() == null || user.getEmail() == null || user.getAge() == null || user.getDateOfBirth() == null || user.getStatus() == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Missing required fields.\"}");
            return;
        }

        // 🔍 Check if the name already exists
        SearchRequest searchRequest = SearchRequest.of(s -> s
            .index("users")
            .query(q -> q
                .term(t -> t
                    .field("name.keyword")
                    .value(user.getName())
                )
            )
        );

        SearchResponse<User> searchResponse = client.search(searchRequest, User.class);

        if (!searchResponse.hits().hits().isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_CONFLICT); // 409 Conflict
            resp.getWriter().write("{\"error\": \"Name already exists.\"}");
            return;
        }

        // Proceed to index
        IndexRequest<User> request = IndexRequest.of(i -> i
            .index("users")
            .document(user)
            .refresh(Refresh.True)
        );

        System.out.println("Indexing user to Elasticsearch...");
        IndexResponse response = client.index(request);
        System.out.println("Index response: " + response.result());
        resp.setStatus(HttpServletResponse.SC_OK);
        resp.getWriter().write("{\"message\": \"User created successfully\"}");
        }

        catch (Exception e) {
            System.out.println("❌ Error indexing user: " + e.getMessage());
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\": \"Failed to index user.\"}");
            return;
        }
    }

    private boolean isAtLeast18YearsOld(String dobString) {
        try {
            LocalDate dob = LocalDate.parse(dobString);
            return Period.between(dob, LocalDate.now()).getYears() >= 18;
        } catch (DateTimeParseException e) {
            return false;
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            int page = Integer.parseInt(req.getParameter("page"));
            int size = Integer.parseInt(req.getParameter("size"));
            int from = (page - 1) * size;

            SearchRequest searchRequest = SearchRequest.of(s -> s
                .index("users")
                .from(from)
                .size(size)
            );

            SearchResponse<User> searchResponse = client.search(searchRequest, User.class);

            List<User> users = searchResponse.hits().hits().stream()
                .map(Hit::source)
                .collect(Collectors.toList());

            // Get total count for pagination
            long totalHits = searchResponse.hits().total().value();
            int totalPages = (int) Math.ceil((double) totalHits / size);

            Map<String, Object> result = new HashMap<>();
            result.put("users", users);
            result.put("totalPages", totalPages);

            resp.setContentType("application/json");
            resp.setCharacterEncoding("UTF-8");
            resp.getWriter().write(new ObjectMapper().writeValueAsString(result));
        } catch (Exception e) {
            e.printStackTrace();
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error fetching users.");
        }
    }

}
