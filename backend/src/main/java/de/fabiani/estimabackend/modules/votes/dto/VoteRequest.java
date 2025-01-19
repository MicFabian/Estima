package de.fabiani.estimabackend.modules.votes.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class VoteRequest {
    private UUID roomId;
    private String participant;
    private Integer value;
}
