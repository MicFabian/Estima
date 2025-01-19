import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';
import { RoomsService } from '../../rooms/data-access/state/rooms.service';
import { VotesService } from '../../votes/data-access/state/votes.service';
import { RoomCreationComponent } from '../../rooms/feature/room-creation/room-creation.component';
import { VotesHistoryComponent } from '../../votes/feature/votes-history/votes-history.component';
import { VoteCreationComponent } from '../../votes/feature/vote-creation/vote-creation.component';
import { RoomResponse } from '../../shared/types/vote.types';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Welcome{{ userName() ? ', ' + userName() : '' }}</h1>
        <app-room-creation></app-room-creation>
      </header>

      <main class="dashboard-content">
        <section class="rooms-list" *ngIf="!isLoading()">
          <h2>Available Rooms</h2>
          <div class="room-grid">
            <div *ngFor="let room of rooms()" 
                 class="room-card"
                 [class.active]="room.id === currentRoom()?.id"
                 (click)="selectRoom(room.id)">
              <h3>{{ room.name }}</h3>
              <p>Participants: {{ room.participants.length || 0 }}</p>
              <div class="room-actions">
                <button *ngIf="!isParticipant(room)" 
                        (click)="joinRoom(room.id); $event.stopPropagation()">
                  Join
                </button>
                <button *ngIf="isParticipant(room)" 
                        (click)="leaveRoom(room.id); $event.stopPropagation()">
                  Leave
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="loading" *ngIf="isLoading()">
          <p>Loading rooms...</p>
        </section>

        <section class="error" *ngIf="error()">
          <p>{{ error() }}</p>
        </section>

        <section class="current-room" *ngIf="currentRoom()">
          <h3>Current Room: {{ currentRoom()?.name }}</h3>
          @if (currentRoom(); as room) {
            @if (isParticipant(room)) {
              <div class="room-actions">
                <button class="leave-btn" (click)="leaveRoom(room.id)">
                  Leave Room
                </button>
                @if (room.votingActive) {
                  <app-vote-creation />
                }
              </div>
            }
          }
          <app-votes-history />
        </section>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .room-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      padding: 20px 0;
    }

    .room-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s;
    }

    .room-card:hover {
      transform: translateY(-2px);
    }

    .room-card.active {
      border: 2px solid #007bff;
    }

    .room-actions {
      display: flex;
      gap: 1rem;
      margin: 1rem 0;
    }

    .leave-btn {
      background-color: #dc3545;
    }

    .leave-btn:hover {
      background-color: #c82333;
    }

    button {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      background: #007bff;
      color: white;
      cursor: pointer;
    }

    button:hover {
      background: #0056b3;
    }

    .loading, .error {
      text-align: center;
      padding: 20px;
    }

    .error {
      color: #dc3545;
    }

    .current-room {
      margin-top: 20px;
    }
  `],
  standalone: true,
  imports: [CommonModule, RoomCreationComponent, VotesHistoryComponent, VoteCreationComponent]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private keycloakService = inject(KeycloakService);
  private roomsService = inject(RoomsService);
  private votesService = inject(VotesService);
  private refreshInterval: number | undefined;

  // Local signals
  readonly userName = signal<string>('');

  // Computed values from services
  readonly rooms = this.roomsService.roomsList;
  readonly currentRoom = this.roomsService.currentRoomValue;
  readonly isLoading = this.roomsService.isLoading;
  readonly error = this.roomsService.errorMessage;

  async ngOnInit() {
    await this.loadUserInfo();
    this.loadRooms();
    this.setupRefreshInterval();
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      window.clearInterval(this.refreshInterval);
    }
  }

  private async loadUserInfo() {
    try {
      console.log(this.keycloakService.isLoggedIn());
      if (!this.keycloakService.isLoggedIn()) {
        return;  // Let the auth guard handle the redirect
      }

      // Use the token directly to get user info
      const userProfile = await this.keycloakService.loadUserProfile();
      console.log(userProfile);
      this.userName.set(userProfile.firstName || userProfile.username || '');
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.userName.set('');  // Reset the username on error
    }
  }

  private loadRooms() {
    this.roomsService.loadRooms();
  }

  private setupRefreshInterval() {
    // Refresh rooms list every 5 seconds
    this.refreshInterval = window.setInterval(() => {
      this.loadRooms();
    }, 5000);
  }

  joinRoom(roomId: string) {
    this.roomsService.joinRoom(roomId);
  }

  leaveRoom(roomId: string) {
    this.roomsService.leaveRoom(roomId);
  }

  selectRoom(roomId: string) {
    const room = this.rooms().find(r => r.id === roomId);
    if (room) {
      this.roomsService.setCurrentRoom(room);
      this.votesService.loadVotesByRoom(roomId);
    }
  }

  isParticipant(room: RoomResponse | null): boolean {
    if (!room) return false;
    try {
      const userId = this.keycloakService.getKeycloakInstance().subject;
      return userId ? room.participants.includes(userId) : false;
    } catch {
      return false;
    }
  }
}