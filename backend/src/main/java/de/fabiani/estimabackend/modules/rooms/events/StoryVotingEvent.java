package de.fabiani.estimabackend.modules.rooms.events;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@Getter
@RequiredArgsConstructor
public class StoryVotingEvent {
    private final UUID storyId;
    private final boolean active;
}
