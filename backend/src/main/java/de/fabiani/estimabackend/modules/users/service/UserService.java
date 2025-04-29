package de.fabiani.estimabackend.modules.users.service;

import de.fabiani.estimabackend.modules.users.dto.UserDto;
import de.fabiani.estimabackend.modules.users.entity.User;
import de.fabiani.estimabackend.modules.users.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof JwtAuthenticationToken) {
            Jwt jwt = ((JwtAuthenticationToken) authentication).getToken();
            String keycloakId = jwt.getSubject();

            return userRepository.findByKeycloakId(keycloakId)
                    .orElseGet(() -> {
                        String username = jwt.getClaimAsString("preferred_username");
                        String email = jwt.getClaimAsString("email");
                        String firstName = jwt.getClaimAsString("given_name");
                        String lastName = jwt.getClaimAsString("family_name");
                        if (username == null || email == null || keycloakId == null) {
                            throw new IllegalStateException("Missing required user information in JWT token");
                        }
                        return createOrUpdateUserFromKeycloak(keycloakId, username, email, firstName, lastName);
                    });
        }

        throw new IllegalStateException("User not authenticated or invalid authentication type");
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUserDto() {
        return UserDto.fromEntity(getCurrentUser());
    }

    @Transactional(readOnly = true)
    public User getUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));
    }

    @Transactional(readOnly = true)
    public UserDto getUserDtoById(UUID userId) {
        return UserDto.fromEntity(getUserById(userId));
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public User createOrUpdateUserFromKeycloak(String keycloakId, String username, String email,
                                              String firstName, String lastName) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElse(User.builder()
                        .keycloakId(keycloakId)
                        .build());

        user.setUsername(username != null ? username : user.getUsername());
        user.setEmail(email != null ? email : user.getEmail());
        user.setFirstName(firstName != null ? firstName : user.getFirstName());
        user.setLastName(lastName != null ? lastName : user.getLastName());

        return userRepository.save(user);
    }
}
