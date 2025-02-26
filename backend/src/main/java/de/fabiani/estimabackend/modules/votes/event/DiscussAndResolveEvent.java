package de.fabiani.estimabackend.modules.votes.event;

import de.fabiani.estimabackend.modules.rooms.Story;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class DiscussAndResolveEvent implements VotingEvent {
    private final Story story;

    @Override
    public String getType() {
        return "discuss_and_resolve";
    }
}
