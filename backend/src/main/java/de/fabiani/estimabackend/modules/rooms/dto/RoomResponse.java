package de.fabiani.estimabackend.modules.rooms.dto;

import de.fabiani.estimabackend.modules.rooms.Room;
import de.fabiani.estimabackend.modules.rooms.Story;
import lombok.Value;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Value
public class RoomResponse {
    UUID id;
    String name;
    String ownerId;
    List<StoryResponse> stories;
    UUID currentStoryId;
    StoryResponse currentStory;
    List<String> participants;
    
    // Team information
    UUID teamId;
    String teamName;

    public RoomResponse(Room room) {
        this.id = room.getId();
        this.name = room.getName();
        this.ownerId = room.getOwnerId();
        this.stories = room.getStories().stream()
                .map(StoryResponse::new)
                .collect(Collectors.toList());
        this.currentStory = room.getCurrentStory() != null ? new StoryResponse(room.getCurrentStory()) : null;
        this.currentStoryId = room.getCurrentStory() != null ? room.getCurrentStory().getId() : null;
        this.participants = room.getParticipants();
        
        // Add team information if this room belongs to a team
        this.teamId = room.getTeam() != null ? room.getTeam().getId() : null;
        this.teamName = room.getTeam() != null ? room.getTeam().getName() : null;
    }

    @Value
    public static class StoryResponse {
        UUID id;
        String title;
        String description;
        Integer estimate;
        boolean votingActive;
        Story.VotingPhase votingPhase;

        public StoryResponse(Story story) {
            this.id = story.getId();
            this.title = story.getTitle();
            this.description = story.getDescription();
            this.estimate = story.getEstimate();
            this.votingActive = story.isVotingActive();
            this.votingPhase = story.getVotingPhase();
        }
    }
}