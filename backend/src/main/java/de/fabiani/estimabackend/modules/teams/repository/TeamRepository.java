package de.fabiani.estimabackend.modules.teams.repository;

import de.fabiani.estimabackend.modules.teams.entity.Team;
import de.fabiani.estimabackend.modules.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamRepository extends JpaRepository<Team, UUID> {
    
    List<Team> findByOwner(User owner);
    
    @Query("SELECT t FROM Team t JOIN t.members m WHERE m = :member")
    List<Team> findByMember(User member);
    
    @Query("SELECT t FROM Team t WHERE t.owner = :user OR :user MEMBER OF t.members")
    List<Team> findAllTeamsForUser(User user);
    
    Optional<Team> findByNameAndOwner(String name, User owner);
    
    boolean existsByNameAndOwner(String name, User owner);
}
