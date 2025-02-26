package de.fabiani.estimabackend.modules.rooms.events;

import de.fabiani.estimabackend.modules.rooms.Story;
import lombok.Getter;

import java.util.UUID;

@Getter
public class StoryDeletedEvent {
    private final UUID roomId;
    private final UUID storyId;

    public StoryDeletedEvent(UUID roomId, UUID storyId) {
        this.roomId = roomId;
        this.storyId = storyId;
    }
}
