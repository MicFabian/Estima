package de.fabiani.estimabackend.modules.votes;

import de.fabiani.estimabackend.modules.votes.dto.VoteResponse;
import de.fabiani.estimabackend.modules.shared.DiscussionStartedEvent;
import de.fabiani.estimabackend.modules.rooms.Story;
import de.fabiani.estimabackend.modules.rooms.events.StoryDeletedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VoteWebSocketService {
    private final SimpMessagingTemplate messagingTemplate;
    private final VoteRepository voteRepository;

    public void broadcastVoteUpdate(String roomId, VoteResponse vote) {
        messagingTemplate.convertAndSend(
            "/topic/rooms/" + roomId + "/votes",
            vote
        );
    }

    public void broadcastVotesList(String roomId, List<VoteResponse> votes) {
        messagingTemplate.convertAndSend(
            "/topic/rooms/" + roomId + "/votes/list",
            votes
        );
    }

    public void broadcastCurrentStoryVotes(UUID roomId, UUID storyId) {
        if (storyId != null) {
            List<Vote> votes = voteRepository.findByRoomIdAndStoryId(roomId, storyId);
            List<VoteResponse> responses = votes.stream()
                    .map(VoteResponse::new)
                    .collect(Collectors.toList());
            broadcastVotesList(roomId.toString(), responses);
        }
    }

    public void loadCurrentStoryVotes(UUID roomId, UUID storyId, String userId) {
        if (storyId != null) {
            List<Vote> votes = voteRepository.findByRoomIdAndStoryId(roomId, storyId);
            List<VoteResponse> responses = votes.stream()
                    .map(VoteResponse::new)
                    .collect(Collectors.toList());
            
            // Send votes directly to the user's private channel
            messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/votes",
                responses
            );
        }
    }

    public void broadcastRoomUpdate(String roomId, int memberCount) {
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/members", memberCount);
    }

    @EventListener
    public void handleDiscussionStartedEvent(DiscussionStartedEvent event) {
        Story story = event.getStory();
        if (story.getRoom() != null) {
            Map<String, Object> discussionEvent = new HashMap<>();
            discussionEvent.put("type", "discussion_started");
            discussionEvent.put("storyId", story.getId().toString());
            discussionEvent.put("votingPhase", story.getVotingPhase().toString());
            
            // Send to the room's topic channel
            messagingTemplate.convertAndSend(
                "/topic/rooms/" + story.getRoom().getId().toString() + "/events",
                discussionEvent
            );
            
            // Also broadcast the current votes for this story
            broadcastCurrentStoryVotes(story.getRoom().getId(), story.getId());
        }
    }
    
    @EventListener
    public void handleStoryDeletedEvent(StoryDeletedEvent event) {
        UUID roomId = event.getRoomId();
        UUID storyId = event.getStoryId();
        
        if (roomId != null && storyId != null) {
            Map<String, Object> deletionEvent = new HashMap<>();
            deletionEvent.put("type", "story_deleted");
            deletionEvent.put("storyId", storyId.toString());
            
            // Send to the room's topic channel
            messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId.toString() + "/events",
                deletionEvent
            );
            
            System.out.println("Published story_deleted event for story " + storyId + " in room " + roomId);
        }
    }
}
