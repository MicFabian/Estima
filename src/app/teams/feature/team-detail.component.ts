import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { TeamService } from '../data-access/team.service';
import { Team } from '../model/team.model';
import { catchError, finalize, tap } from 'rxjs/operators';
import { RoomService } from '../../rooms/data-access/room.service';
import { Room, RoomRequest } from '../../rooms/data-access/room.model';
import { CreateRoomDialogComponent, CreateRoomDialogData } from './create-room-dialog/create-room-dialog.component';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatChipsModule,
    MatDialogModule,
    MatExpansionModule
  ],
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.css']
})
export class TeamDetailComponent implements OnInit {
  team: Team | null = null;
  loading = false;
  error = '';
  isMember = false;
  
  // Room-related properties
  teamRooms: Room[] = [];
  loadingRooms = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private roomService: RoomService,
    public dialog: MatDialog,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    // Get the team ID from the route
    this.route.paramMap.subscribe({
      next: (params) => {
        const teamId = params.get('id');
        if (!teamId) {
          this.error = 'Team ID is required';
          this.loading = false;
          return;
        }
        
        this.teamService.getTeamById(teamId).subscribe({
          next: (team) => {
            this.team = team;
            this.loading = false;
            // Load profile first, then check membership
            this.keycloakService.loadUserProfile().then(profile => {
              console.log('Keycloak profile loaded for membership check:', profile);
              this.checkMembership(profile); // Pass profile to checkMembership
              if (this.isMember && team.id) {
                this.loadTeamRooms(team.id); // Load rooms if member
              }
            }).catch(err => {
              console.error('Failed to load Keycloak profile:', err);
              // Handle profile load error - maybe default to not member?
              this.isMember = false; 
            });
          },
          error: (err) => {
            console.error('Error loading team:', err);
            this.error = 'Failed to load team details: ' + (err.error?.message || 'Unknown error');
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error with route params:', err);
        this.error = 'An unexpected error occurred';
        this.loading = false;
      }
    });
  }

  /**
   * Loads rooms associated with this team
   */
  loadTeamRooms(teamId: string): void {
    this.loadingRooms = true;
    
    this.roomService.getRoomsByTeamId(teamId)
      .pipe(
        finalize(() => this.loadingRooms = false)
      )
      .subscribe({
        next: (rooms) => {
          this.teamRooms = rooms;
        },
        error: (error) => {
          console.error('Error loading team rooms:', error);
          // Optionally show an error message to the user
        }
      });
  }

  checkMembership(profile: any): void {
    if (!this.team || !profile) {
      console.warn('Cannot check membership: Team data or Keycloak profile missing.');
      this.isMember = false; 
      return;
    }
    
    this.isMember = false; // Reset membership status
    
    // Use profile data for comparison
    const currentUserId = profile.id || profile.sub; // Keycloak often uses 'sub' for subject ID
    const username = profile.username;
    
    console.log('Checking membership using profile - ID:', currentUserId, 'Username:', username);
    
    // Check if user is the owner
    if (this.team.owner && (
      (currentUserId && this.team.owner.id === currentUserId) || 
      (username && this.team.owner.username === username)
    )) {
      console.log('User is the team owner - setting isMember=true');
      this.isMember = true;
      return;
    }
    
    // Check if user is in member list - by ID or username
    if (this.team.members && this.team.members.length > 0) {
      for (const member of this.team.members) {
        if (
          (currentUserId && member.id === currentUserId) ||
          (username && member.username === username)
        ) {
          console.log('User is in the members list - setting isMember=true');
          this.isMember = true;
          break;
        }
      }
    }
    
    console.log(`Final membership status: ${this.isMember}`);
  }

  joinTeam(): void {
    if (!this.team?.id) return;

    this.loading = true;
    // Send a request to the backend to add the current authenticated user
    this.teamService.addMember(this.team.id, { userId: 'current' }).subscribe({
      next: team => {
        this.team = team;
        this.isMember = true; // Update membership status
        this.loading = false;
        // Load team rooms immediately after joining
        if (team.id) {
          this.loadTeamRooms(team.id);
        }
      },
      error: (err) => {
        console.error('Error joining team:', err);
        this.error = 'Failed to join team: ' + (err.error?.message || 'Unknown error');
        this.loading = false;
      }
    });
  }
  
  /**
   * Opens the room creation dialog using MatDialog
   */
  createRoom(): void {
    if (!this.team) return;

    const dialogRef = this.dialog.open<CreateRoomDialogComponent, CreateRoomDialogData, string>(
      CreateRoomDialogComponent,
      {
        width: '400px',
        data: { teamName: this.team.name }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // User confirmed creation, result is the room name
        this.submitNewRoom(result);
      }
    });
  }
  
  /**
   * Submits the new room to be created (called after dialog closes)
   * @param roomName The name entered by the user in the dialog
   */
  private submitNewRoom(roomName: string): void {
    if (!this.team?.id || !roomName) return;
    
    const roomRequest: RoomRequest = {
      name: roomName,
      teamId: this.team.id
    };
    
    // Display loading indicator for room creation?
    
    this.roomService.createRoom(roomRequest)
      .subscribe({
        next: (room) => {
          this.teamRooms = [...this.teamRooms, room];
          // Optionally navigate to the new room or show success message
          // this.router.navigate(['/rooms', room.id]);
        },
        error: (error) => {
          console.error('Error creating room:', error);
          alert('Failed to create room. Please try again.'); // Replace with better error handling
        }
      });
  }
  
  /**
   * Explicit navigation to teams list using the router
   * Provides an alternative way to navigate if routerLink is not working
   */
  navigateToTeams(): void {
    console.log('Navigating to teams list...');
    this.router.navigate(['/teams']);
  }

  // Helper function to generate color from string
  /**
   * Gets count of regular members (excluding owner, but including current user)
   */
  getRegularMembersCount(): number {
    if (!this.team || !this.team.members) {
      return 0;
    }
    
    // If no owner, all members are regular members
    if (!this.team.owner) {
      return this.team.members.length;
    }
    
    // Count all non-owner members
    const ownerId = this.team.owner.id;
    // We consider all members except the owner as regular members
    return this.team.members.length;
  }
  
  /**
   * Checks if a member is the owner
   */
  isOwner(member: any): boolean {
    return this.team?.owner?.id === member.id;
  }
  
  /**
   * Checks if there are no regular members
   */
  hasNoRegularMembers(): boolean {
    if (!this.team || !this.team.members || this.team.members.length === 0) {
      return true;
    }
    
    return this.team.members.length === 1 && this.team.owner && this.team.members[0].id === this.team.owner.id;
  }
  
  stringToColor(str: string | undefined): string {
    if (!str) {
      return '#cccccc'; // Default gray for undefined/empty strings
    }
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      // Make colors brighter and less likely to be very dark
      const adjustedValue = Math.floor((value + 255) / 2);
      color += ('00' + adjustedValue.toString(16)).substr(-2);
    }
    return color;
  }

  // Helper function to get first letter
}
