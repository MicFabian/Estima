package de.fabiani.estimabackend.modules.votes;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoteRepository extends JpaRepository<Vote, UUID> {
    Optional<Vote> findByRoomIdAndStoryIdAndUserId(UUID roomId, UUID storyId, String userId);
    List<Vote> findByRoomIdAndStoryId(UUID roomId, UUID storyId);
    List<Vote> findByRoomId(UUID roomId);
    
    @Modifying
    @Query("DELETE FROM Vote v WHERE v.room.id = :roomId AND v.story.id = :storyId")
    void deleteByRoomIdAndStoryId(UUID roomId, UUID storyId);
    
    @Modifying
    @Query("DELETE FROM Vote v WHERE v.story.id = :storyId")
    void deleteByStoryId(UUID storyId);
}
