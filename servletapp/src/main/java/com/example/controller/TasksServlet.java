package com.example.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Objects;

import com.example.models.Task;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.apache.http.HttpHost;// Correct HttpHost for ES RestClient
import org.elasticsearch.client.RestClient;
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.Refresh;
import co.elastic.clients.elasticsearch.core.IndexRequest;
import co.elastic.clients.elasticsearch.core.IndexResponse;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;


import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/api/tasks/*") 
public class TasksServlet extends HttpServlet{
    private ElasticsearchClient client;
    private ObjectMapper mapper; // Not static

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

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String user = req.getParameter("user"); // e.g., ?owner=admin

        if (user == null || user.isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Missing user parameter.\"}");
            return;
        }

        SearchRequest searchRequest = SearchRequest.of(s -> s
            .index("tasks")
            .query(q -> q
                .term(t -> t
                    .field("taskOwner") // ensure exact match
                    .value(user)
                )
            )
        );

        SearchResponse<Task> searchResponse = client.search(searchRequest, Task.class);

        List<Task> tasks = searchResponse.hits().hits().stream()
        .map(hit -> {
            Task task = hit.source();
            if (task != null) {
                task.setTaskID(hit.id()); // 👈 attach the auto-generated ES doc ID
            }
            return task;
        })
        .filter(Objects::nonNull)
        .collect(Collectors.toList());


        resp.setContentType("application/json");
        resp.setStatus(HttpServletResponse.SC_OK);
        resp.getWriter().write(mapper.writeValueAsString(tasks));
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo(); // e.g., /1234
        if (pathInfo == null || pathInfo.equals("/")) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Missing task ID in the URL.\"}");
            return;
        }

        String taskID = pathInfo.substring(1); // Remove the leading '/'
        System.out.println("Updating task with ID: " + taskID);

        try {
            // Read the JSON body
            BufferedReader reader = req.getReader();
            String json = reader.lines().collect(Collectors.joining());
            Task updatedTask = mapper.readValue(json, Task.class);

            // Validate fields
            if (updatedTask.getTaskName() == null || updatedTask.getTaskStartDate() == null || 
                updatedTask.getTaskEndDate() == null || updatedTask.getTaskOwner() == null || 
                updatedTask.getTaskColor() == null) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\": \"Missing required fields.\"}");
                return;
            }

            if (updatedTask.getTaskEndDate().isBefore(updatedTask.getTaskStartDate())) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\": \"End date must be after start date.\"}");
                return;
            }

            if (!updatedTask.getTaskName().matches("^[a-zA-Z0-9@-]+$")) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("{\"error\": \"Invalid task name.\"}");
                return;
            }

            // Overwrite the document with the provided ID
            IndexRequest<Task> request = IndexRequest.of(i -> i
                .index("tasks")
                .id(taskID)
                .document(updatedTask)
                .refresh(Refresh.True)
            );

            IndexResponse response = client.index(request);
            System.out.println("Updated task ID: " + response.id());

            resp.setStatus(HttpServletResponse.SC_OK);
            resp.getWriter().write("{\"message\": \"Task updated successfully.\"}");
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"error\": \"Failed to update task.\"}");
        }
    }

}
