package de.fabiani.estimabackend.modules.votes;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VoteRepository extends JpaRepository<Vote, UUID> {
    List<Vote> findByRoomId(UUID roomId);
    
    @Modifying
    @Query("DELETE FROM Vote v WHERE v.room.id = :roomId")
    void deleteByRoomId(UUID roomId);
    
    @Modifying
    @Query("DELETE FROM Vote v WHERE v.room.id = :roomId AND v.userId = :userId")
    void deleteByRoomIdAndUserId(UUID roomId, String userId);
}
