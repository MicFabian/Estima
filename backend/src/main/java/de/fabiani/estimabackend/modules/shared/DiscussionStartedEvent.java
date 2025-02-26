package de.fabiani.estimabackend.modules.shared;

import de.fabiani.estimabackend.modules.rooms.Story;
import lombok.Getter;

@Getter
public class DiscussionStartedEvent {
    private final Story story;

    public DiscussionStartedEvent(Story story) {
        this.story = story;
    }
}
