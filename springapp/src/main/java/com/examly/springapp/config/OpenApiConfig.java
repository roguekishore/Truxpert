package com.examly.springapp.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Food Truck Vendor API")
                        .version("1.0")
                        .description("API for Food Truck Vendor Management System")
                        .contact(new Contact()
                                .name("API Support")
                                .email("support@foodtruck.com")));
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("food-truck-api")
                .pathsToMatch("/api/**")
                .pathsToExclude("/api/profile/**") // Exclude Spring Data REST profile endpoints
                .build();
    }
}
