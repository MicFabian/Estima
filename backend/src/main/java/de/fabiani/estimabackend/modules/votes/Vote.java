package de.fabiani.estimabackend.modules.votes;

import de.fabiani.estimabackend.modules.rooms.Room;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "votes")
@Data
@NoArgsConstructor
public class Vote {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private VoteValue value;

    public Vote(Room room, String userId, Integer value) {
        this.id = UUID.randomUUID();
        this.room = room;
        this.userId = userId;
        this.value = VoteValue.fromInt(value);
    }
}