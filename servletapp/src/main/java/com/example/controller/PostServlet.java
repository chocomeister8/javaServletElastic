package com.example.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.stream.Collectors;

import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;

import com.example.models.Task;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.Refresh;
import co.elastic.clients.elasticsearch.core.IndexRequest;
import co.elastic.clients.elasticsearch.core.IndexResponse;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;


@WebServlet("/api/posts")
public class PostServlet extends HttpServlet {
    private ElasticsearchClient client;
    private ObjectMapper mapper;

    @Override
    public void init() throws ServletException {
        // Create low-level REST client
        RestClient restClient = RestClient.builder(new HttpHost("localhost", 9200, "http")).build();

        // 🔧 Register JavaTimeModule for Elasticsearch mapper
        mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Create transport with Jackson mapper
        ElasticsearchTransport transport = new RestClientTransport(restClient, new JacksonJsonpMapper(mapper));

        // Create high-level Elasticsearch client
        client = new ElasticsearchClient(transport);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            BufferedReader reader = req.getReader();
            String json = reader.lines().collect(Collectors.joining());
            System.out.println("Incoming JSON: " + json);


            // Read tasks from the captured JSON string
            Task task = mapper.readValue(json, Task.class);

            // Field Validation
            if (task.getTaskName() == null || task.getTaskStartDate() == null || task.getTaskEndDate() == null || task.getTaskOwner() == null || task.getTaskColor() == null) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\": \"Missing required fields.\"}");
                return;
            }
            
            if (!task.getTaskName().matches("^[a-zA-Z0-9@-]+$")) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\": \"Task name can only contain letters (A–Z, a–z), numbers (0–9), hyphens (-), and the @ symbol.\"}");
                return;
            }

            if (task.getTaskEndDate().isBefore(task.getTaskStartDate())) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\": \"End date must be after start date.\"}");
                return;
            }

            IndexRequest<Task> request = IndexRequest.of(i -> i.index("tasks").document(task).refresh(Refresh.True));

            System.out.println("Indexing task to Elasticsearch...");
            IndexResponse response = client.index(request);
            System.out.println("Index response: " + response.result());
            System.out.println("Generated ID: " + response.id());  // ✅ Optional: log or return this

            resp.setStatus(HttpServletResponse.SC_OK);
            resp.getWriter().write("{\"message\": \"Task created successfully\", \"id\": \"" + response.id() + "\"}");
        }
        catch (Exception e) {
            System.out.println("❌ Error indexing task: " + e.getMessage());
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\": \"Failed to index task.\"}");
            return;
        }
    }
}
