package de.fabiani.estimabackend.modules.votes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class VoteRequest {
    @NotNull
    private UUID roomId;

    @NotNull
    private UUID storyId;

    @NotBlank
    private String value;
}
