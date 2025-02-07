package de.fabiani.estimabackend.modules.rooms;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.util.UUID;

@Entity
@Table(name = "stories")
@Data
@NoArgsConstructor
public class Story {
    public enum VotingPhase {
        VOTING,     // Initial voting phase
        DISCUSSING, // All votes are in, discussing results
        FINISHED   // Final estimate agreed upon
    }

    @Id
    @UuidGenerator
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer estimate;

    @Column(nullable = false)
    private boolean votingActive = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VotingPhase votingPhase = VotingPhase.VOTING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    @JsonBackReference
    private Room room;

    public Story(String title, String description, Room room) {
        this.title = title;
        this.description = description;
        this.room = room;
        this.votingActive = false;
    }
}
