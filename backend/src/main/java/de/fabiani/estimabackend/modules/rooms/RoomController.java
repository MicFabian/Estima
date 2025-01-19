package de.fabiani.estimabackend.modules.rooms;

import de.fabiani.estimabackend.modules.rooms.dto.CreateRoomRequest;
import de.fabiani.estimabackend.modules.rooms.dto.RoomResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;

    @PostMapping
    public RoomResponse createRoom(@RequestBody CreateRoomRequest request, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        Room room = roomService.createRoom(request.getName(), userId);
        return new RoomResponse(room);
    }

    @GetMapping("/{roomId}")
    public RoomResponse getRoom(@PathVariable UUID roomId) {
        Room room = roomService.getRoom(roomId);
        return new RoomResponse(room);
    }

    @PostMapping("/{roomId}/join")
    public RoomResponse joinRoom(@PathVariable UUID roomId, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        Room room = roomService.joinRoom(roomId, userId);
        return new RoomResponse(room);
    }

    @PostMapping("/{roomId}/leave")
    public RoomResponse leaveRoom(@PathVariable UUID roomId, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        Room room = roomService.leaveRoom(roomId, userId);
        return new RoomResponse(room);
    }

    @PostMapping("/{roomId}/start-voting")
    public RoomResponse startVoting(@PathVariable UUID roomId, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        Room room = roomService.startVoting(roomId, userId);
        return new RoomResponse(room);
    }

    @PostMapping("/{roomId}/stop-voting")
    public RoomResponse stopVoting(@PathVariable UUID roomId, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        Room room = roomService.stopVoting(roomId, userId);
        return new RoomResponse(room);
    }

    @GetMapping
    public List<RoomResponse> getAllRooms() {
        return roomService.getAllRooms().stream()
                .map(RoomResponse::new)
                .collect(Collectors.toList());
    }
}