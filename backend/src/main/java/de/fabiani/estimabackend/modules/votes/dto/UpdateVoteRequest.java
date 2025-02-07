package de.fabiani.estimabackend.modules.votes.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateVoteRequest {
    @NotBlank
    private String value;
}
