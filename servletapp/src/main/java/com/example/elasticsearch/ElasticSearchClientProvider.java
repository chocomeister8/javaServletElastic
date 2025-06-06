package com.example.elasticsearch;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;

import org.apache.http.HttpHost;
import org.apache.http.message.BasicHeader;
import org.apache.http.Header;
import org.elasticsearch.client.RestClient;

import java.io.Closeable;
import java.io.IOException;
import java.util.Base64;

public class ElasticSearchClientProvider {

    private static final String USERNAME = "elastic"; // or your custom user
    private static final String PASSWORD = "JeS3EmhzojSgYy6qh083"; // set your password
    private static final String HOST = "localhost";  // or your ES host
    private static final int PORT = 9200;

    // This class wraps both ElasticsearchClient and RestClient
    public static class ClientWrapper implements Closeable {
        public final ElasticsearchClient esClient;
        private final RestClient restClient; // we need to close this

        private ClientWrapper(ElasticsearchClient esClient, RestClient restClient) {
            this.esClient = esClient;
            this.restClient = restClient;
        }

        @Override
        public void close() throws IOException {
            restClient.close(); // release resources
        }
    }

    public static ClientWrapper getClient() {
        // Encode credentials in Base64
        String auth = Base64.getEncoder().encodeToString((USERNAME + ":" + PASSWORD).getBytes());

        // Set HTTP Basic Auth header
        RestClient restClient = RestClient.builder(new HttpHost(HOST, PORT, "https"))
            .setDefaultHeaders(new Header[] {
                new BasicHeader("Authorization", "Basic " + auth)
            })
            .build();
            
        // Create high-level client
        RestClientTransport transport = new RestClientTransport(restClient, new JacksonJsonpMapper());
        ElasticsearchClient esClient = new ElasticsearchClient(transport);

        return new ClientWrapper(esClient, restClient);
    }
}
