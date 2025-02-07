package de.fabiani.estimabackend.modules.votes;

import de.fabiani.estimabackend.modules.votes.dto.VoteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
}
