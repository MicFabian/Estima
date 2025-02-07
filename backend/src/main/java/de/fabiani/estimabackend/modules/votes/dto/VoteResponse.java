package de.fabiani.estimabackend.modules.votes.dto;

import de.fabiani.estimabackend.modules.votes.Vote;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class VoteResponse {
    private final UUID id;
    private final UUID roomId;
    private final UUID storyId;
    private final String userId;
    private final String value;
    private final boolean ready;
    private final Instant createdAt;

    public VoteResponse(Vote vote) {
        this.id = vote.getId();
        this.roomId = vote.getRoom().getId();
        this.storyId = vote.getStory().getId();
        this.userId = vote.getUserId();
        this.value = vote.getValue();
        this.ready = vote.isReady();
        this.createdAt = vote.getCreatedAt();
    }
}
