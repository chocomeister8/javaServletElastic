package com.example.Controller;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.GetRequest;
import co.elastic.clients.elasticsearch.core.GetResponse;
import co.elastic.clients.elasticsearch.core.IndexRequest;
import co.elastic.clients.elasticsearch.core.IndexResponse;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.UpdateRequest;
import co.elastic.clients.elasticsearch.core.UpdateResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;

import java.util.ArrayList;
import java.util.List;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.example.Models.User; // ✅ Add this line
import com.example.Utils.jwtUtils;

public class UserController {

    public static String login(String index, String email, String password, ElasticsearchClient client) throws Exception {
        // Search for the user by email
        SearchResponse<User> response = client.search(s -> s.index(index).query(q -> q.match(t -> t.field("email").query(email))), User.class);
        if (response.hits().hits().isEmpty()) {
            throw new Exception("Email not found.");
        }

        User user = response.hits().hits().get(0).source();
        if (user != null && user.getPassword().equals(password)) {
            System.out.println("Login successful for: " + user.getName());
            return jwtUtils.generateToken(email); // return JWT
        } else {
            throw new Exception("Invalid credentials");
        }
    }

    public static void logout(String index, String email, ElasticsearchClient client) throws Exception {
        System.out.println("User logged out: " + email);
    }

    private static List<String> validateUser(User user) {
        List<String> errors = new ArrayList<>();

        if (user.getName() == null || user.getName().isBlank()) {
            errors.add("Name cannot be empty.");
        }
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            errors.add("Password cannot be empty.");
        }
        if (user.getEmail() == null || !user.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            errors.add("Invalid email format.");
        }
        if (user.getAge() == null || user.getAge() <= 0) {
            errors.add("Age must be a positive number.");
        }
        if (user.getDateOfBirth() == null || !user.getDateOfBirth().matches("\\d{4}-\\d{2}-\\d{2}")) {
            errors.add("Date of birth must be in the format yyyy-MM-dd.");
        }

        return errors;
    }

    public static void createUser(String index, String docId, User user, String token, ElasticsearchClient client) throws Exception {
        System.out.println("Received token: " + token);

        String requesterEmail;
        try {
            requesterEmail = jwtUtils.verifyToken(token); // ✅ Use your utility method
        } catch (JWTVerificationException e) {
            System.out.println("Access denied: Invalid or expired token.");
            return;
        }

        SearchResponse<User> result = client.search(s -> s
                .index(index)
                .query(q -> q.match(t -> t.field("email").query(requesterEmail))),
                User.class
        );
        if (result.hits().hits().isEmpty()) {
            System.out.println("Access denied: Requester not found.");
            return;
        }

        List<String> errors = validateUser(user);
        if (!errors.isEmpty()) {
            System.out.println("Validation failed:");
            errors.forEach(System.out::println);
            return;
        }

        IndexRequest<User> request = IndexRequest.of(i -> i
            .index(index)
            .id(docId)
            .document(user)
        );

        IndexResponse response = client.index(request);
        System.out.println("User inserted with ID: " + response.id());
    }

    // RETRIEVE
    public static User retrieveUser(String index, String docId, ElasticsearchClient client) throws Exception {
        GetRequest request = GetRequest.of(g -> g
            .index(index)
            .id(docId)
        );

        GetResponse<User> response = client.get(request, User.class);

        if (response.found()) {
            System.out.println("User retrieved: " + response.source());
            return response.source();
        } else {
            System.out.println("User not found with ID: " + docId);
            return null;
        }
    }

    public static List<User> retrieveAllUsers(String index, ElasticsearchClient client) throws Exception {
        SearchResponse<User> response = client.search(s -> s
                .index(index)
                .query(q -> q.matchAll(m -> m)) // match all documents
                .size(1000), // adjust based on expected user count
            User.class);

        List<User> users = new ArrayList<>();
        for (Hit<User> hit : response.hits().hits()) {
            users.add(hit.source());
        }
        return users;
    }

    // UPDATE
    public static void updateUser(String index, String docId, User updatedUser, ElasticsearchClient client) throws Exception {
        List<String> errors = validateUser(updatedUser);
        if (!errors.isEmpty()) {
            System.out.println("Validation failed:");
            errors.forEach(System.out::println);
            return;
        }

        UpdateRequest<User, User> request = UpdateRequest.of(u -> u
            .index(index)
            .id(docId)
            .doc(updatedUser)
        );

        UpdateResponse<User> response = client.update(request, User.class);
        System.out.println("User updated with ID: " + response.id());
    }
}

