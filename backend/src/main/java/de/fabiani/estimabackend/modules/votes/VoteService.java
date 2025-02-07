package de.fabiani.estimabackend.modules.votes;

import de.fabiani.estimabackend.modules.rooms.Room;
import de.fabiani.estimabackend.modules.rooms.RoomRepository;
import de.fabiani.estimabackend.modules.rooms.Story;
import de.fabiani.estimabackend.modules.rooms.events.StoryVotingEvent;
import de.fabiani.estimabackend.modules.votes.dto.VoteResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoteService {
    private final VoteRepository voteRepository;
    private final RoomRepository roomRepository;

    @Transactional
    public VoteResponse vote(UUID roomId, UUID storyId, String userId, String value) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found"));

        Story story = room.getStories().stream()
                .filter(s -> s.getId().equals(storyId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Story not found"));

        if (!story.isVotingActive()) {
            throw new IllegalStateException("Voting is not active for this story");
        }

        Vote vote = voteRepository.findByRoomIdAndStoryIdAndUserId(roomId, storyId, userId)
                .orElse(new Vote());

        vote.setRoom(room);
        vote.setStory(story);
        vote.setUserId(userId);
        vote.setValue(value);

        Vote savedVote = voteRepository.save(vote);
        return new VoteResponse(savedVote);
    }

    @Transactional(readOnly = true)
    public List<VoteResponse> getVotesForStory(UUID roomId, UUID storyId) {
        return voteRepository.findByRoomIdAndStoryId(roomId, storyId)
                .stream()
                .map(VoteResponse::new)
                .toList();
    }

    public List<VoteResponse> getVotesByRoom(UUID roomId) {
        return voteRepository.findByRoomId(roomId).stream()
                .map(VoteResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public VoteResponse updateVote(UUID voteId, String value, String userId) {
        Vote vote = voteRepository.findById(voteId)
                .orElseThrow(() -> new EntityNotFoundException("Vote not found"));

        if (!vote.getUserId().equals(userId)) {
            throw new IllegalStateException("Only the vote owner can update their vote");
        }

        Story story = vote.getStory();
        if (!story.isVotingActive()) {
            throw new IllegalStateException("Voting is not active for this story");
        }

        // If marking as ready/not ready, preserve the original vote value
        if (value.equals("ready") || value.equals("not_ready")) {
            vote.setReady(value.equals("ready"));
        } else {
            vote.setValue(value);
            vote.setReady(false); // Reset ready status when changing vote
        }

        return new VoteResponse(voteRepository.save(vote));
    }

    @EventListener
    @Transactional
    public void handleStoryVotingEvent(StoryVotingEvent event) {
        if (event.isActive()) {
            // When voting starts, do nothing to preserve existing votes
            return;
        }

        // When voting stops/paused, clear previous votes
        voteRepository.deleteByStoryId(event.getStoryId());
    }
}
