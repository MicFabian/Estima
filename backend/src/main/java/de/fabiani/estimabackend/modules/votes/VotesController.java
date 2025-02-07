package de.fabiani.estimabackend.modules.votes;

import de.fabiani.estimabackend.modules.votes.dto.UpdateVoteRequest;
import de.fabiani.estimabackend.modules.votes.dto.VoteRequest;
import de.fabiani.estimabackend.modules.votes.dto.VoteResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/votes")
@RequiredArgsConstructor
public class VotesController {
    private final VoteService voteService;
    private final JwtDecoder jwtDecoder;

    @PostMapping
    public ResponseEntity<VoteResponse> vote(
            @Valid @RequestBody VoteRequest request,
            @RequestHeader("Authorization") String token) {
        Jwt jwt = jwtDecoder.decode(token.replace("Bearer ", ""));
        return ResponseEntity.ok(voteService.vote(request.getRoomId(), request.getStoryId(), jwt.getSubject(), request.getValue()));
    }

    @GetMapping("/room/{roomId}/story/{storyId}")
    public ResponseEntity<List<VoteResponse>> getVotesForStory(
            @PathVariable UUID roomId,
            @PathVariable UUID storyId,
            @RequestHeader("Authorization") String token) {
        Jwt jwt = jwtDecoder.decode(token.replace("Bearer ", ""));
        return ResponseEntity.ok(voteService.getVotesForStory(roomId, storyId));
    }

    @PutMapping("/{voteId}")
    public ResponseEntity<VoteResponse> updateVote(
            @PathVariable UUID voteId,
            @Valid @RequestBody UpdateVoteRequest request,
            @RequestHeader("Authorization") String token) {
        Jwt jwt = jwtDecoder.decode(token.replace("Bearer ", ""));
        return ResponseEntity.ok(voteService.updateVote(voteId, request.getValue(), jwt.getSubject()));
    }
}
