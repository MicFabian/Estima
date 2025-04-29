package de.fabiani.estimabackend.modules.teams.controller;

import de.fabiani.estimabackend.modules.teams.dto.CreateTeamRequest;
import de.fabiani.estimabackend.modules.teams.dto.TeamDto;
import de.fabiani.estimabackend.modules.teams.dto.TeamMemberRequest;
import de.fabiani.estimabackend.modules.teams.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<TeamDto>> getAllTeamsForCurrentUser() {
        return ResponseEntity.ok(teamService.getAllTeamsForCurrentUser());
    }

    @GetMapping("/{teamId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<TeamDto> getTeamById(@PathVariable UUID teamId) {
        return ResponseEntity.ok(teamService.getTeamById(teamId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<TeamDto> createTeam(@Valid @RequestBody CreateTeamRequest request) {
        return new ResponseEntity<>(teamService.createTeam(request), HttpStatus.CREATED);
    }

    @PutMapping("/{teamId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<TeamDto> updateTeam(
            @PathVariable UUID teamId,
            @Valid @RequestBody CreateTeamRequest request) {
        return ResponseEntity.ok(teamService.updateTeam(teamId, request));
    }

    @DeleteMapping("/{teamId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Void> deleteTeam(@PathVariable UUID teamId) {
        teamService.deleteTeam(teamId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{teamId}/members")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<TeamDto> addMemberToTeam(
            @PathVariable UUID teamId,
            @Valid @RequestBody TeamMemberRequest request) {
        // Handle both the 'current' special value and normal UUIDs
        return ResponseEntity.ok(teamService.addMemberToTeam(teamId, request.getUserId()));
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<TeamDto> removeMemberFromTeam(
            @PathVariable UUID teamId,
            @PathVariable String userId) {
        return ResponseEntity.ok(teamService.removeMemberFromTeam(teamId, userId));
    }
}
