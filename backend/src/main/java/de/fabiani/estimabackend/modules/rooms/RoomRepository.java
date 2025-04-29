package de.fabiani.estimabackend.modules.rooms;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {
    
    /**
     * Find all rooms associated with a specific team
     * 
     * @param teamId The UUID of the team
     * @return List of rooms belonging to the team
     */
    List<Room> findByTeamId(UUID teamId);
}
