package de.fabiani.estimabackend.modules.teams.service;

import de.fabiani.estimabackend.modules.teams.dto.CreateTeamRequest;
import de.fabiani.estimabackend.modules.teams.dto.TeamDto;
import de.fabiani.estimabackend.modules.teams.entity.Team;
import de.fabiani.estimabackend.modules.teams.repository.TeamRepository;
import de.fabiani.estimabackend.modules.users.entity.User;
import de.fabiani.estimabackend.modules.users.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<TeamDto> getAllTeamsForCurrentUser() {
        User currentUser = userService.getCurrentUser();
        return teamRepository.findAllTeamsForUser(currentUser).stream()
                .map(TeamDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TeamDto getTeamById(UUID teamId) {
        Team team = findTeamById(teamId);
        validateTeamAccess(team);
        return TeamDto.fromEntity(team);
    }

    @Transactional
    public TeamDto createTeam(CreateTeamRequest request) {
        User currentUser = userService.getCurrentUser();
        
        if (teamRepository.existsByNameAndOwner(request.getName(), currentUser)) {
            throw new IllegalArgumentException("You already have a team with this name");
        }
        
        Team team = Team.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(currentUser)
                .build();
        
        team.addMember(currentUser);
        Team savedTeam = teamRepository.save(team);
        
        return TeamDto.fromEntity(savedTeam);
    }

    @Transactional
    public TeamDto updateTeam(UUID teamId, CreateTeamRequest request) {
        Team team = findTeamById(teamId);
        validateTeamOwnership(team);
        
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        
        Team updatedTeam = teamRepository.save(team);
        return TeamDto.fromEntity(updatedTeam);
    }

    @Transactional
    public void deleteTeam(UUID teamId) {
        Team team = findTeamById(teamId);
        validateTeamOwnership(team);
        teamRepository.delete(team);
    }

    @Transactional
    public TeamDto addMemberToTeam(UUID teamId, String userId) {
        Team team = findTeamById(teamId);
        validateTeamOwnership(team);
        
        User user;
        // Special case for "current" user
        if ("current".equalsIgnoreCase(userId)) {
            user = userService.getCurrentUser();
        } else {
            // Otherwise try to parse it as a UUID
            try {
                UUID userUuid = UUID.fromString(userId);
                user = userService.getUserById(userUuid);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid user ID format. Expected UUID or 'current'");
            }
        }
        
        team.addMember(user);
        
        Team updatedTeam = teamRepository.save(team);
        return TeamDto.fromEntity(updatedTeam);
    }

    @Transactional
    public TeamDto removeMemberFromTeam(UUID teamId, String userId) {
        Team team = findTeamById(teamId);
        validateTeamOwnership(team);
        
        User user;
        // Special case for "current" user
        if ("current".equalsIgnoreCase(userId)) {
            user = userService.getCurrentUser();
        } else {
            // Otherwise try to parse it as a UUID
            try {
                UUID userUuid = UUID.fromString(userId);
                user = userService.getUserById(userUuid);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid user ID format. Expected UUID or 'current'");
            }
        }
        
        // Prevent removing the owner from the team
        if (team.getOwner().equals(user)) {
            throw new IllegalArgumentException("Cannot remove the team owner from the team");
        }
        
        team.removeMember(user);
        
        Team updatedTeam = teamRepository.save(team);
        return TeamDto.fromEntity(updatedTeam);
    }

    private Team findTeamById(UUID teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Team not found with ID: " + teamId));
    }

    private void validateTeamAccess(Team team) {
        User currentUser = userService.getCurrentUser();
        if (!team.getOwner().equals(currentUser) && !team.getMembers().contains(currentUser)) {
            throw new IllegalStateException("You don't have access to this team");
        }
    }

    private void validateTeamOwnership(Team team) {
        User currentUser = userService.getCurrentUser();
        if (!team.getOwner().equals(currentUser)) {
            throw new IllegalStateException("You must be the team owner to perform this action");
        }
    }
}
