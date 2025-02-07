package de.fabiani.estimabackend.modules.votes;

import de.fabiani.estimabackend.modules.rooms.Room;
import de.fabiani.estimabackend.modules.rooms.Story;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "votes")
@Getter
@Setter
@NoArgsConstructor
public class Vote {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne
    @JoinColumn(name = "story_id")
    private Story story;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "value")
    private String value;

    @Column(name = "ready")
    private boolean ready;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public Vote(Room room, Story story, String userId) {
        this.room = room;
        this.story = story;
        this.userId = userId;
        this.createdAt = Instant.now();
    }
}