package de.fabiani.estimabackend.modules.votes.event;

import de.fabiani.estimabackend.modules.rooms.Story;

public interface VotingEvent {
    String getType();
    Story getStory();
}
