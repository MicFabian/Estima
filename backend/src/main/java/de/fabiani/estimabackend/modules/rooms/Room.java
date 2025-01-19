package de.fabiani.estimabackend.modules.rooms;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

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
    
    private boolean votingActive;

    @Column(nullable = false)
    private String ownerId;

    public Room(String name, String ownerId) {
        this.name = name;
        this.ownerId = ownerId;
        this.votingActive = false;
        this.participants = new ArrayList<>();
        this.participants.add(ownerId); // Owner is automatically a participant
    }
}