package de.fabiani.estimabackend.modules.rooms;

import de.fabiani.estimabackend.modules.teams.entity.Team;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
public class Room {
    @Id
    @UuidGenerator
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @ElementCollection
    @CollectionTable(name = "room_participants", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "user_id")
    private List<String> participants = new ArrayList<>();

    @Column(nullable = false)
    private String ownerId;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Story> stories = new ArrayList<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_story_id")
    private Story currentStory;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    public Room(String name, String ownerId) {
        this.name = name;
        this.ownerId = ownerId;
        this.participants = new ArrayList<>();
        this.participants.add(ownerId); // Owner is automatically a participant
        this.stories = new ArrayList<>();
    }
    
    public Room(String name, String ownerId, Team team) {
        this(name, ownerId);
        this.team = team;
    }
}