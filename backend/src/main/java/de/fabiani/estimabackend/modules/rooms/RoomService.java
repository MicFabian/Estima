package de.fabiani.estimabackend.modules.rooms;

import de.fabiani.estimabackend.modules.rooms.Room;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository roomRepository;

    @Transactional
    public Room createRoom(String name, String userId) {
        Room room = new Room(name, userId);
        return roomRepository.save(room);
    }

    @Transactional(readOnly = true)
    public Room getRoom(UUID id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
    }

    @Transactional(readOnly = true)
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    @Transactional
    public Room joinRoom(UUID roomId, String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required");
        }

        Room room = getRoom(roomId);
        if (!room.getParticipants().contains(userId)) {
            room.getParticipants().add(userId);
        }
        return roomRepository.save(room);
    }

    @Transactional
    public Room leaveRoom(UUID roomId, String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required");
        }

        Room room = getRoom(roomId);
        if (room.getParticipants().contains(userId)) {
            room.getParticipants().remove(userId);
        }
        return roomRepository.save(room);
    }

    @Transactional
    public Room startVoting(UUID roomId, String userId) {
        Room room = getRoom(roomId);
        
        if (!room.getOwnerId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the room owner can start voting");
        }
        
        room.setVotingActive(true);
        return roomRepository.save(room);
    }

    @Transactional
    public Room stopVoting(UUID roomId, String userId) {
        Room room = getRoom(roomId);
        
        if (!room.getOwnerId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the room owner can stop voting");
        }
        
        room.setVotingActive(false);
        return roomRepository.save(room);
    }
}
