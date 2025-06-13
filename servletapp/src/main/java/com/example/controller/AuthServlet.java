package com.example.controller;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.example.Utils.JwtUtil;
import com.example.models.User;
import com.fasterxml.jackson.databind.ObjectMapper;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.MatchQuery;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import jakarta.servlet.annotation.WebServlet;


@WebServlet("/api/auth") 
public class AuthServlet extends HttpServlet {

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
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");

        try {
            // Read JSON body from request
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = req.getReader().readLine()) != null) {
                sb.append(line);
            }
            String body = sb.toString();
            System.out.println("📩 Received payload: " + body); // 👈 Add this line

            // Parse JSON
            org.json.JSONObject json = new org.json.JSONObject(body);
            String name = json.getString("name");
            String password = json.getString("password");

            // Query Elasticsearch by username only
            SearchRequest searchRequest = new SearchRequest.Builder()
                .index("users")
                .query(q -> q.term(t -> t
                    .field("name")
                    .value(name)
                ))
                .build();

            SearchResponse<User> searchResponse = client.search(searchRequest, User.class);
            List<Hit<User>> hits = searchResponse.hits().hits();

            System.out.println("🔎 Searching for name: " + name);
            System.out.println("📊 Total hits found: " + hits.size());

            if (!hits.isEmpty()) {
                User user = hits.get(0).source();
                String hashedPassword = user.getPassword();

                System.out.println("🔍 Raw password entered: " + password);
                System.out.println("🔍 Hashed password from ES: " + hashedPassword);

                BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

                // Verify raw password with hashed password
                if (encoder.matches(password, hashedPassword)) {
                    // Password matches - generate JWT and set cookie
                    String jwt = JwtUtil.generateToken(user.getName());

                    Cookie tokenCookie = new Cookie("token", jwt);
                    tokenCookie.setHttpOnly(true);
                    tokenCookie.setPath("/");
                    tokenCookie.setMaxAge(3600); // 1 hour
                    resp.addCookie(tokenCookie);

                    resp.setStatus(HttpServletResponse.SC_OK);
                    resp.getWriter().write("{\"message\":\"Login successful\"}");
                    return;
                }
            }

            // Invalid credentials
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"message\":\"Invalid username or password\"}");

        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"message\":\"Server error.\"}");
        }
    }

    // Handle logout by clearing cookie
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Cookie cookie = new Cookie("token", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0); // Delete cookie
        resp.addCookie(cookie);

        resp.setStatus(HttpServletResponse.SC_OK);
        resp.getWriter().write("{\"message\":\"Logged out\"}");
    }
};
