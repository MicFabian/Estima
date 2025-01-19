package de.fabiani.estimabackend.modules.configurations.application;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class ConfigController {
    private final String keycloakUrl;
    private final String realm;
    private final String clientId;

    public ConfigController(
            @Value("${keycloak.auth-server-url}") String keycloakUrl,
            @Value("${keycloak.realm}") String realm,
            @Value("${keycloak.resource}") String clientId) {
        this.keycloakUrl = keycloakUrl;
        this.realm = realm;
        this.clientId = clientId;
    }

    @GetMapping("/api/config")
    public Map<String, Object> getConfig() {
        return Map.of("keycloak", Map.of(
                "url", keycloakUrl,
                "realm", realm,
                "clientId", clientId
        ));
    }
}