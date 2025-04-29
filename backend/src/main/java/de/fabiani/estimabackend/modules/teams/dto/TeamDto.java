package de.fabiani.estimabackend.modules.teams.dto;

import de.fabiani.estimabackend.modules.teams.entity.Team;
import de.fabiani.estimabackend.modules.users.dto.UserDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamDto {
    private UUID id;
    private String name;
    private String description;
    private UserDto owner;
    private Set<UserDto> members;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TeamDto fromEntity(Team team) {
        return TeamDto.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .owner(UserDto.fromEntity(team.getOwner()))
                .members(team.getMembers().stream()
                        .map(UserDto::fromEntity)
                        .collect(Collectors.toSet()))
                .createdAt(team.getCreatedAt())
                .updatedAt(team.getUpdatedAt())
                .build();
    }
}
