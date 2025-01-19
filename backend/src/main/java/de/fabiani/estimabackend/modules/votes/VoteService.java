package de.fabiani.estimabackend.modules.votes;

import de.fabiani.estimabackend.modules.rooms.Room;
import de.fabiani.estimabackend.modules.rooms.RoomService;
import de.fabiani.estimabackend.modules.votes.dto.VoteRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VoteService {
    private final VoteRepository voteRepository;
    private final RoomService roomService;

    @Transactional
    public Vote createVote(VoteRequest request, String userId) {
        Room room = roomService.getRoom(request.getRoomId());
        
        if (!room.getParticipants().contains(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You must be a participant to vote");
        }
        
        if (!room.isVotingActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voting is not active in this room");
        }

        // Remove any existing vote by this user in this room
        voteRepository.deleteByRoomIdAndUserId(request.getRoomId(), userId);
        
        Vote vote = new Vote(room, userId, request.getValue());
        return voteRepository.save(vote);
    }

    @Transactional(readOnly = true)
    public List<Vote> getVotesByRoomId(UUID roomId, String userId) {
        Room room = roomService.getRoom(roomId);
        
        if (!room.getParticipants().contains(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You must be a participant to view votes");
        }
        
        return voteRepository.findByRoomId(roomId);
    }

    @Transactional
    public void deleteVotesByRoomId(UUID roomId, String userId) {
        Room room = roomService.getRoom(roomId);
        
        if (!room.getOwnerId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the room owner can clear votes");
        }
        
        voteRepository.deleteByRoomId(roomId);
    }
}
