package de.fabiani.estimabackend.modules.rooms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class RoomRequest {
    @NotBlank(message = "Room name is required")
    private String name;
    
    // Team is optional - rooms can belong to a team or be independent
    private UUID teamId;
}
