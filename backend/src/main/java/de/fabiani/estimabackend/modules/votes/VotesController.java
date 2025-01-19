package de.fabiani.estimabackend.modules.votes;

import de.fabiani.estimabackend.modules.votes.dto.VoteRequest;
import de.fabiani.estimabackend.modules.votes.dto.VoteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/votes")
@RequiredArgsConstructor
public class VotesController {
    private final VoteService voteService;

    @PostMapping
    public ResponseEntity<VoteResponse> createVote(
            @RequestBody VoteRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(new VoteResponse(voteService.createVote(request, userId)));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<VoteResponse>> getVotesByRoom(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String userId = jwt.getSubject();
        List<VoteResponse> votes = voteService.getVotesByRoomId(roomId, userId).stream()
                .map(VoteResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(votes);
    }

    @DeleteMapping("/room/{roomId}")
    public ResponseEntity<Void> clearVotes(
            @PathVariable UUID roomId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String userId = jwt.getSubject();
        voteService.deleteVotesByRoomId(roomId, userId);
        return ResponseEntity.noContent().build();
    }
}
