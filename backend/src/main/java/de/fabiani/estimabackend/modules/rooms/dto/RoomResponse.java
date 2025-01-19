package de.fabiani.estimabackend.modules.rooms.dto;

import de.fabiani.estimabackend.modules.rooms.Room;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class RoomResponse {
    private final UUID id;
    private final String name;
    private final List<String> participants;
    private final boolean votingActive;

    public RoomResponse(Room room) {
        this.id = room.getId();
        this.name = room.getName();
        this.participants = room.getParticipants();
        this.votingActive = room.isVotingActive();
    }
}