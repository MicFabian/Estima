package de.fabiani.estimabackend.modules.rooms;

import de.fabiani.estimabackend.modules.rooms.dto.FinalizeStoryRequest;
import de.fabiani.estimabackend.modules.rooms.dto.RoomRequest;
import de.fabiani.estimabackend.modules.rooms.dto.RoomResponse;
import de.fabiani.estimabackend.modules.rooms.dto.StoryRequest;
import de.fabiani.estimabackend.modules.rooms.events.StoryVotingEvent;
import de.fabiani.estimabackend.modules.shared.EventService;
import de.fabiani.estimabackend.modules.votes.VoteRepository;
import de.fabiani.estimabackend.modules.votes.event.DiscussAndResolveEvent;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;
    private final VoteRepository voteRepository;
    private final EventService eventService;

    @Transactional
    public Room getRoomById(UUID id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room with ID " + id + " not found. Please check the room ID and try again."));
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoomResponse(UUID id) {
        return new RoomResponse(getRoomById(id));
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(RoomResponse::new)
                .collect(Collectors.toList());
    }

    private Room getRoomAndVerifyOwner(UUID roomId, String userId) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }

        Room room = getRoomById(roomId);
        if (!room.getOwnerId().equals(userId)) {
            throw new IllegalStateException("Only the room owner can perform this action");
        }
        return room;
    }

    @Transactional
    public RoomResponse startVoting(UUID roomId, UUID storyId, String userId) {
        Room room = getRoomAndVerifyOwner(roomId, userId);
        
        Story story = room.getStories().stream()
                .filter(s -> s.getId().equals(storyId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Story not found"));

        if (room.getCurrentStory() == null || !room.getCurrentStory().getId().equals(storyId)) {
            throw new IllegalArgumentException("Story must be selected before starting voting");
        }

        // Clear old votes before starting new voting round
        voteRepository.deleteByRoomIdAndStoryId(roomId, storyId);

        // Start voting
        story.setVotingActive(true);
        
        eventService.publish(new StoryVotingEvent(storyId, true));
        
        RoomResponse response = new RoomResponse(roomRepository.save(room));
        return response;
    }

    @Transactional
    public RoomResponse pauseVoting(UUID roomId, UUID storyId, String userId) {
        Room room = getRoomAndVerifyOwner(roomId, userId);
        
        Story story = room.getStories().stream()
                .filter(s -> s.getId().equals(storyId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Story not found"));

        // Verify this is the currently selected story
        if (room.getCurrentStory() == null || !room.getCurrentStory().getId().equals(storyId)) {
            throw new IllegalArgumentException("This story is not currently selected. Please select the story first.");
        }

        // Pause voting
        story.setVotingActive(false);
        
        eventService.publish(new StoryVotingEvent(storyId, false));
        
        RoomResponse response = new RoomResponse(roomRepository.save(room));
        return response;
    }

    @Transactional
    public RoomResponse selectStory(UUID roomId, UUID storyId, String userId) {
        Room room = getRoomAndVerifyOwner(roomId, userId);
        
        Story story = room.getStories().stream()
                .filter(s -> s.getId().equals(storyId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Story not found"));

        room.setCurrentStory(story);
        return new RoomResponse(roomRepository.save(room));
    }

    @Transactional
    public RoomResponse createRoom(RoomRequest request, String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        if (request == null || request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Room name cannot be null or empty");
        }

        Room room = new Room(request.getName(), userId);
        return new RoomResponse(roomRepository.save(room));
    }

    @Transactional
    public RoomResponse joinRoom(UUID roomId, String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }

        Room room = getRoomById(roomId);
        if (!room.getParticipants().contains(userId)) {
            room.getParticipants().add(userId);
            room = roomRepository.save(room);
        }

        // If there's a current story, load its votes for the new participant
        if (room.getCurrentStory() != null) {
        }

        return new RoomResponse(room);
    }

    @Transactional
    public RoomResponse leaveRoom(UUID roomId, String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }

        Room room = getRoomById(roomId);
        room.getParticipants().remove(userId);
        roomRepository.save(room);

        return new RoomResponse(room);
    }

    @Transactional
    public RoomResponse addStory(UUID roomId, StoryRequest request, String userId) {
        Room room = getRoomById(roomId);
        if (!room.getParticipants().contains(userId)) {
            room.getParticipants().add(userId);
        }
         
        Story story = new Story(request.getTitle(), request.getDescription(), room);
        room.getStories().add(story);
        
        return new RoomResponse(roomRepository.save(room));
    }

    @Transactional
    public RoomResponse removeStory(UUID roomId, UUID storyId, String userId) {
        Room room = getRoomAndVerifyOwner(roomId, userId);
        
        Story story = room.getStories().stream()
                .filter(s -> s.getId().equals(storyId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Story not found"));

        room.getStories().remove(story);
        
        // If this was the current story, clear it
        if (room.getCurrentStory() != null && room.getCurrentStory().getId().equals(storyId)) {
            room.setCurrentStory(null);
        }
        
        // Delete any votes for this story
        voteRepository.deleteByRoomIdAndStoryId(roomId, storyId);
        
        // Publish event to notify clients about story deletion
        eventService.notifyStoryDeleted(roomId, storyId);
        
        return new RoomResponse(roomRepository.save(room));
    }

    @Transactional
    public RoomResponse finalizeStory(UUID roomId, UUID storyId, FinalizeStoryRequest request, String userId) {
        Room room = getRoomAndVerifyOwner(roomId, userId);
        
        Story story = room.getStories().stream()
                .filter(s -> s.getId().equals(storyId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Story not found"));

        if (room.getCurrentStory() == null || !room.getCurrentStory().getId().equals(storyId)) {
            throw new IllegalArgumentException("This story is not currently selected");
        }

        story.setEstimate(request.getEstimate());
        story.setVotingActive(false);
        room.setCurrentStory(null);
        
        RoomResponse response = new RoomResponse(roomRepository.save(room));
        return response;
    }

    @Transactional
    public void deleteRoom(UUID roomId, String userId) {
        Room room = getRoomAndVerifyOwner(roomId, userId);
        roomRepository.delete(room);
    }

    private Room getRoomAndVerifyParticipant(UUID roomId, String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }

        Room room = getRoomById(roomId);
        
        if (!room.getParticipants().contains(userId)) {
            throw new IllegalStateException("User must be a participant to perform this operation");
        }

        return room;
    }

    @Transactional
    public RoomResponse moveToDiscussion(UUID roomId, UUID storyId, String userId) {
        Room room = getRoomAndVerifyOwner(roomId, userId);
        Story story = findStoryInRoom(room, storyId);

        story.setVotingPhase(Story.VotingPhase.DISCUSSING);
        story.setVotingActive(false);
        
        // Publish both events to maintain backward compatibility and trigger the discussion phase
        eventService.publish(new StoryVotingEvent(storyId, false));
        eventService.publish(new DiscussAndResolveEvent(story));
        
        return new RoomResponse(roomRepository.save(room));
    }

    @Transactional
    public RoomResponse startNewVotingRound(UUID roomId, UUID storyId, String userId) {
        Room room = getRoomAndVerifyOwner(roomId, userId);
        Story story = findStoryInRoom(room, storyId);

        // Clear old votes before starting new voting round
        voteRepository.deleteByRoomIdAndStoryId(roomId, storyId);

        story.setVotingPhase(Story.VotingPhase.VOTING);
        story.setVotingActive(true);
        
        eventService.publish(new StoryVotingEvent(storyId, true));
        
        return new RoomResponse(roomRepository.save(room));
    }

    @Transactional
    public RoomResponse finishVoting(UUID roomId, UUID storyId, String userId) {
        Room room = getRoomAndVerifyOwner(roomId, userId);
        Story story = findStoryInRoom(room, storyId);

        story.setVotingPhase(Story.VotingPhase.FINISHED);
        story.setVotingActive(false);
        
        eventService.publish(new StoryVotingEvent(storyId, false));
        
        return new RoomResponse(roomRepository.save(room));
    }

    private Story findStoryInRoom(Room room, UUID storyId) {
        return room.getStories().stream()
                .filter(s -> s.getId().equals(storyId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Story not found"));
    }
}
