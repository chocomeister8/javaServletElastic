package com.example.elasticsearch;


import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.indices.CreateIndexResponse;
import java.io.IOException;

public class ElasticUserIndexCreator {

    private static final String INDEX_NAME = "users";

    public static void main(String[] args) {
            try (ElasticSearchClientProvider.ClientWrapper wrapper = ElasticSearchClientProvider.getClient()) {
                ElasticsearchClient client = wrapper.esClient;
                createUserIndex(client);
            } catch (IOException e) {
                e.printStackTrace();
        }
    }

    public static void createUserIndex(ElasticsearchClient client) throws IOException {
        // Check if the index already exists
        boolean exists = client.indices().exists(e -> e.index(INDEX_NAME)).value();
        if (exists) {
            System.out.println("ℹ️ Index '" + INDEX_NAME + "' already exists.");
            return;
        }

        // Create the index with mappings
        CreateIndexResponse response = client.indices().create(c -> c
            .index(INDEX_NAME)
            .mappings(m -> m
                .properties("name", p -> p.text(t -> t))
                .properties("password", p -> p.keyword(k -> k))
                .properties("email", p -> p.keyword(k -> k))
                .properties("age", p -> p.integer(i -> i))
                .properties("dateOfBirth", p -> p.keyword(k -> k)) // or p.date(...) if always valid format
                .properties("status", p -> p.keyword(k -> k))
                .properties("groups", p -> p.keyword(k -> k))
            )
        );

        if (response.acknowledged()) {
            System.out.println("✅ Index 'Users' created successfully.");
        } else {
            System.out.println("❌ Failed to create index.");
        }
    }
}
