package com.example.controller;

import com.example.Utils.JwtUtil;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;

import com.example.models.User; // Your User class


@WebServlet("/api/user-info")
public class UserInfoServlet extends HttpServlet {
    private ElasticsearchClient client;

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
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // Get JWT token from cookie named "token"
        String token = null;
        Cookie[] cookies = req.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        if (token == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.setContentType("application/json");
            PrintWriter out = resp.getWriter();
            out.print("{\"message\": \"Missing token cookie\"}");
            out.flush();
            return;
        }

        try {
            // ✅ Extract name from token
            String name = JwtUtil.extractSubject(token);

            SearchRequest searchRequest = SearchRequest.of(s -> s
                .index("users")
                .query(q -> q
                    .term(t -> t
                        .field("name")
                        .value(name)
                    )
                )
                .size(1)
            );

            SearchResponse<User> searchResponse = client.search(searchRequest, User.class);
            List<Hit<User>> hits = searchResponse.hits().hits();

            if (hits.isEmpty()) {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                resp.getWriter().write("{\"message\": \"User not found\"}");
                return;
            }

            User user = hits.get(0).source();
            // ✅ Block if user is disabled
            if ("disabled".equalsIgnoreCase(user.getStatus())) {
                resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                resp.setContentType("application/json");
                resp.getWriter().write("{\"message\": \"Invalid login\"}");
                return;
            }

            // ✅ If everything is good, return user info
            resp.setStatus(HttpServletResponse.SC_OK);
            resp.setContentType("application/json");
            resp.getWriter().write("{\"name\": \"" + user.getName() + "\", \"groups\": \"" + user.getGroups() + "\"}");
            
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.setContentType("application/json");
            PrintWriter out = resp.getWriter();
            out.print("{\"message\": \"Invalid or expired token\"}");
            out.flush();
        }
    }
}
