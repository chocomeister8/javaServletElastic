package com.example.elasticsearch;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.cluster.HealthResponse;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.impl.client.BasicCredentialsProvider;
// import org.apache.http.impl.nio.client.HttpAsyncClientBuilder;
// import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.ssl.SSLContextBuilder;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;

import javax.net.ssl.SSLContext;

public class ElasticSearchConnectionTest {
    public static void main(String[] args) {
        try {
            final String username = "elastic"; // default superuser
            final String password = "JeS3EmhzojSgYy6qh083"; // set your actual password

            SSLContext sslContext = SSLContextBuilder
                    .create()
                    .loadTrustMaterial((chain, authType) -> true)
                    .build();

            BasicCredentialsProvider credentialsProvider = new BasicCredentialsProvider();
            credentialsProvider.setCredentials(AuthScope.ANY,
                    new UsernamePasswordCredentials(username, password));

            RestClientBuilder builder = RestClient.builder(
                    new HttpHost("localhost", 9200, "https")
            ).setHttpClientConfigCallback(httpClientBuilder -> httpClientBuilder
                    .setSSLContext(sslContext)
                    .setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE)
                    .setDefaultCredentialsProvider(credentialsProvider)
            );

            RestClient restClient = builder.build();
            RestClientTransport transport = new RestClientTransport(restClient, new JacksonJsonpMapper());
            ElasticsearchClient client = new ElasticsearchClient(transport);

            HealthResponse response = client.cluster().health();
            System.out.println("✅ Connected! Cluster status: " + response.status());

            restClient.close();
        } catch (Exception e) {
            System.err.println("❌ Failed to connect:");
            e.printStackTrace();
        }
    }
}
