package de.fabiani.estimabackend.modules.rooms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RoomRequest {
    @NotBlank(message = "Room name is required")
    private String name;
}
