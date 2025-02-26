package de.fabiani.estimabackend.modules.shared;

import de.fabiani.estimabackend.modules.votes.event.VotingEvent;
import de.fabiani.estimabackend.modules.rooms.Story;
import de.fabiani.estimabackend.modules.rooms.events.StoryDeletedEvent;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EventService {
    private final ApplicationEventPublisher eventPublisher;

    public void publish(Object event) {
        eventPublisher.publishEvent(event);
        // Check if event is an instance of VotingEvent before processing further
        if (event instanceof VotingEvent) {
            VotingEvent votingEvent = (VotingEvent) event;
            if (votingEvent.getType().equals("discuss_and_resolve")) {
                // New behavior: transition to discussion phase
                Story story = votingEvent.getStory();
                story.setVotingActive(false);
                story.setVotingPhase(Story.VotingPhase.DISCUSSING);
                notifyDiscussionStarted(story);
            }
        }
    }

    private void notifyDiscussionStarted(Story story) {
        // Publish a discussion started event that can be handled by WebSocket listeners
        eventPublisher.publishEvent(new DiscussionStartedEvent(story));
    }
    
    public void notifyStoryDeleted(UUID roomId, UUID storyId) {
        // Publish a story deleted event that can be handled by WebSocket listeners
        eventPublisher.publishEvent(new StoryDeletedEvent(roomId, storyId));
    }
}
