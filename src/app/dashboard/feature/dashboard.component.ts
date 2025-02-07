import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomsService } from '../../rooms/data-access/state/rooms.service';
import { Room } from '../../shared/types/room.types';
import { VoteCreationComponent } from '../../votes/feature/vote-creation/vote-creation.component';
import { VotesHistoryComponent } from '../../votes/feature/votes-history/votes-history.component';
import { RoomCreationComponent } from '../../rooms/feature/room-creation/room-creation.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    VoteCreationComponent,
    VotesHistoryComponent,
    RoomCreationComponent
  ],
  template: `
    <div class="dashboard">
      <div class="rooms-panel">
        <h2>Available Rooms</h2>
        @if (isLoading()) {
          <p>Loading rooms...</p>
        } @else if (error()) {
          <p class="error">{{ error() }}</p>
        } @else {
          <div class="rooms-list">
            @for (room of rooms(); track room.id) {
              <div class="room-card" [class.selected]="room.id === currentRoom()?.id">
                <div class="room-info">
                  <h3>{{ room.title }}</h3>
                  <p>Stories: {{ room.stories.length || 0 }}</p>
                </div>
                <div class="room-actions">
                  @if (room.id === currentRoom()?.id) {
                    <button (click)="leaveRoom(room.id)" class="btn btn-danger">Leave</button>
                  } @else {
                    <button (click)="joinRoom(room.id)" class="btn btn-primary">Join</button>
                  }
                </div>
              </div>
            }
          </div>
        }
        <app-room-creation />
      </div>

      @if (currentRoom()) {
        <div class="room-content">
          <h2>Room: {{ currentRoom()?.title }}</h2>
          <div class="room-components">
            <app-vote-creation />
            <app-votes-history />
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      gap: 2rem;
      padding: 1rem;
    }
    .rooms-panel {
      flex: 0 0 300px;
    }
    .room-content {
      flex: 1;
    }
    .rooms-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .room-card {
      padding: 1rem;
      border: 1px solid #dee2e6;
      border-radius: 0.25rem;
      background-color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .room-card.selected {
      border-color: #007bff;
      background-color: #f8f9fa;
    }
    .room-info h3 {
      margin: 0 0 0.5rem 0;
    }
    .room-info p {
      margin: 0;
      color: #6c757d;
    }
    .room-actions {
      display: flex;
      gap: 0.5rem;
    }
    .btn {
      padding: 0.375rem 0.75rem;
      border-radius: 0.25rem;
      border: 1px solid transparent;
      cursor: pointer;
    }
    .btn-primary {
      background-color: #007bff;
      border-color: #007bff;
      color: white;
    }
    .btn-danger {
      background-color: #dc3545;
      border-color: #dc3545;
      color: white;
    }
    .error {
      color: #dc3545;
    }
    .room-components {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private roomsService = inject(RoomsService);

  readonly rooms = this.roomsService.roomsList;
  readonly currentRoom = this.roomsService.currentRoom;
  readonly isLoading = this.roomsService.isLoading;
  readonly error = this.roomsService.errorMessage;

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.roomsService.loadRooms();
  }

  joinRoom(roomId: string): void {
    this.roomsService.joinRoom(roomId);
  }

  leaveRoom(roomId: string): void {
    this.roomsService.leaveRoom(roomId);
  }

  selectRoom(room: Room): void {
    if (room.id !== this.currentRoom()?.id) {
      this.roomsService.setCurrentRoom(room);
    }
  }
}