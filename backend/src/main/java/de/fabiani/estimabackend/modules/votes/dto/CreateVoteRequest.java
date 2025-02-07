package de.fabiani.estimabackend.modules.votes.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateVoteRequest {
    @NotNull
    private UUID roomId;
    
    @NotNull
    private String value;
}
