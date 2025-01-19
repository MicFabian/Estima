import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VotesService } from '../../data-access/state/votes.service';
import { RoomsService } from '../../../rooms/data-access/state/rooms.service';

@Component({
  selector: 'app-votes-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="votes-history">
      <h3>Votes History</h3>
      @if (currentRoom(); as room) {
        <div class="room-info">
          <h4>{{ room.name }}</h4>
          @if (room.votingActive) {
            <span class="status active">Voting Active</span>
          } @else {
            <span class="status inactive">Voting Inactive</span>
          }
        </div>
      }

      @if (isLoading()) {
        <div class="loading">Loading votes...</div>
      } @else if (error()) {
        <div class="error">{{ error() }}</div>
      } @else {
        <div class="votes-list">
          @for (vote of votes(); track vote.userId) {
            <div class="vote-item">
              <span class="participant">{{ vote.userId }}</span>
              <span class="value">{{ vote.value }}</span>
            </div>
          }
          @empty {
            <div class="no-votes">No votes yet</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .votes-history {
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .room-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .status {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .status.active {
      background: #e6f4ea;
      color: #1e7e34;
    }

    .status.inactive {
      background: #f8d7da;
      color: #721c24;
    }

    .votes-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .vote-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .participant {
      font-weight: 500;
    }

    .value {
      background: #e9ecef;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: bold;
    }

    .loading, .error, .no-votes {
      text-align: center;
      padding: 1rem;
      color: #6c757d;
    }

    .error {
      color: #dc3545;
    }
  `]
})
export class VotesHistoryComponent {
  private votesService = inject(VotesService);
  private roomsService = inject(RoomsService);

  readonly votes = this.votesService.votesList;
  readonly isLoading = this.votesService.isLoading;
  readonly error = this.votesService.errorMessage;
  readonly currentRoom = this.roomsService.currentRoomValue;
}
