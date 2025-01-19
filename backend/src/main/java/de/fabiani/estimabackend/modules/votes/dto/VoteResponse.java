package de.fabiani.estimabackend.modules.votes.dto;

import de.fabiani.estimabackend.modules.votes.Vote;
import de.fabiani.estimabackend.modules.votes.VoteValue;
import lombok.Data;

import java.util.UUID;

@Data
public class VoteResponse {
    private final UUID id;
    private final UUID roomId;
    private final String participant;
    private final VoteValue value;

    public VoteResponse(Vote vote) {
        this.id = vote.getId();
        this.roomId = vote.getRoom().getId();
        this.participant = vote.getUserId();
        this.value = vote.getValue();
    }
}
