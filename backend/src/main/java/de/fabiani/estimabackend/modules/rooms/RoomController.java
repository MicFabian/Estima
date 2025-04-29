package de.fabiani.estimabackend.modules.rooms;

import de.fabiani.estimabackend.modules.rooms.dto.FinalizeStoryRequest;
import de.fabiani.estimabackend.modules.rooms.dto.RoomRequest;
import de.fabiani.estimabackend.modules.rooms.dto.RoomResponse;
import de.fabiani.estimabackend.modules.rooms.dto.StoryRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;
    private final JwtDecoder jwtDecoder;

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms(
            @RequestHeader("Authorization") String token) {
        // Decode JWT token to verify authentication, but we're not using the JWT content
        jwtDecoder.decode(token.replace("Bearer ", ""));
        return ResponseEntity.ok(roomService.getAllRooms());
    }
    
    @GetMapping("/by-team/{teamId}")
    public ResponseEntity<List<RoomResponse>> getRoomsByTeamId(
            @PathVariable UUID teamId,
            @RequestHeader("Authorization") String token) {
        // Decode JWT token to verify authentication, but we're not using the JWT content
        jwtDecoder.decode(token.replace("Bearer ", ""));
        return ResponseEntity.ok(roomService.getRoomsByTeamId(teamId));
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(
            @Valid @RequestBody RoomRequest request,
            @RequestHeader("Authorization") String token) {
        Jwt jwt = jwtDecoder.decode(token.replace("Bearer ", ""));
        return ResponseEntity.ok(roomService.createRoom(request, jwt.getSubject()));
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<RoomResponse> joinRoom(
            @PathVariable UUID roomId,
            @RequestHeader("Authorization") String token) {
        Jwt jwt = jwtDecoder.decode(token.replace("Bearer ", ""));
        return ResponseEntity.ok(roomService.joinRoom(roomId, jwt.getSubject()));
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<RoomResponse> leaveRoom(
            @PathVariable UUID roomId,
            @RequestHeader("Authorization") String token) {
        Jwt jwt = jwtDecoder.decode(token.replace("Bearer ", ""));
        return ResponseEntity.ok(roomService.leaveRoom(roomId, jwt.getSubject()));
    }

    @PostMapping("/{roomId}/stories")
    public ResponseEntity<RoomResponse> addStory(
            @PathVariable UUID roomId,
            @Valid @RequestBody StoryRequest request,
            @RequestHeader("Authorization") String token) {
        Jwt jwt = jwtDecoder.decode(token.replace("Bearer ", ""));
        return ResponseEntity.ok(roomService.addStory(roomId, request, jwt.getSubject()));
    }

    @PostMapping("/{roomId}/stories/{storyId}/select")
    public ResponseEntity<RoomResponse> selectStory(
            @PathVariable UUID roomId,
            @PathVariable UUID storyId,
            @RequestHeader("Authorization") String token) {
        Jwt jwt = jwtDecoder.decode(token.replace("Bearer ", ""));
        return ResponseEntity.ok(roomService.selectStory(roomId, storyId, jwt.getSubject()));
    }

    @PostMapping("/{roomId}/stories/{storyId}/start-voting")
    public ResponseEntity<RoomResponse> startVoting(
            @PathVariable UUID roomId,
            @PathVariable UUID storyId,
            @RequestHeader("Authorization") String token) {
        Jwt jwt = jwtDecoder.decode(token.replace("Bearer ", ""));
        return ResponseEntity.ok(roomService.startVoting(roomId, storyId, jwt.getSubject()));
    }

    @PostMapping("/{roomId}/stories/{storyId}/pause-voting")
    public ResponseEntity<RoomResponse> pauseVoting(
            @PathVariable UUID roomId,
            @PathVariable UUID storyId,
            @RequestHeader("Authorization") String token) {
        Jwt jwt = jwtDecoder.decode(token.replace("Bearer ", ""));
        return ResponseEntity.ok(roomService.pauseVoting(roomId, storyId, jwt.getSubject()));
    }

    @PostMapping("/{roomId}/stories/{storyId}/discuss")
    public ResponseEntity<RoomResponse> moveToDiscussion(
            @PathVariable UUID roomId,
            @PathVariable UUID storyId,
            @RequestHeader("Authorization") String token) {
        Jwt jwt = jwtDecoder.decode(token.replace("Bearer ", ""));
        return ResponseEntity.ok(roomService.moveToDiscussion(roomId, storyId, jwt.getSubject()));
    }

    @PostMapping("/{roomId}/stories/{storyId}/revote")
    public ResponseEntity<RoomResponse> startNewVotingRound(
            @PathVariable UUID roomId,
            @PathVariable UUID storyId,
            @RequestHeader("Authorization") String token) {
        Jwt jwt = jwtDecoder.decode(token.replace("Bearer ", ""));
        return ResponseEntity.ok(roomService.startNewVotingRound(roomId, storyId, jwt.getSubject()));
    }

    @PostMapping("/{roomId}/stories/{storyId}/finish")
    public ResponseEntity<RoomResponse> finishVoting(
            @PathVariable UUID roomId,
            @PathVariable UUID storyId,
            @RequestHeader("Authorization") String token) {
        Jwt jwt = jwtDecoder.decode(token.replace("Bearer ", ""));
        return ResponseEntity.ok(roomService.finishVoting(roomId, storyId, jwt.getSubject()));
    }

    @PostMapping("/{roomId}/stories/{storyId}/finalize")
    public ResponseEntity<RoomResponse> finalizeStory(
            @PathVariable UUID roomId,
            @PathVariable UUID storyId,
            @Valid @RequestBody FinalizeStoryRequest request,
            @RequestHeader("Authorization") String token) {
        Jwt jwt = jwtDecoder.decode(token.replace("Bearer ", ""));
        return ResponseEntity.ok(roomService.finalizeStory(roomId, storyId, request, jwt.getSubject()));
    }

    @DeleteMapping("/{roomId}/stories/{storyId}")
    public ResponseEntity<RoomResponse> removeStory(
            @PathVariable UUID roomId,
            @PathVariable UUID storyId,
            @RequestHeader("Authorization") String token) {
        Jwt jwt = jwtDecoder.decode(token.replace("Bearer ", ""));
        return ResponseEntity.ok(roomService.removeStory(roomId, storyId, jwt.getSubject()));
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable UUID roomId,
            @RequestHeader("Authorization") String token) {
        Jwt jwt = jwtDecoder.decode(token.replace("Bearer ", ""));
        roomService.deleteRoom(roomId, jwt.getSubject());
        return ResponseEntity.noContent().build();
    }
}