import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VotesService } from '../../data-access/state/votes.service';
import { RoomsService } from '../../../rooms/data-access/state/rooms.service';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-vote-creation',
  template: `
    <div class="vote-creation">
      <h4>Cast Your Vote</h4>
      <div class="vote-buttons">
        <button *ngFor="let value of voteValues; trackBy: trackValue" class="vote-btn" (click)="submitVote(value)">
          {{ value }}
        </button>
      </div>
      <div>
        <div *ngFor="let vote of votes()">
          User {{ vote.userId }}: {{ vote.value }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vote-creation {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h4 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
    }

    .vote-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
      gap: 0.5rem;
    }

    .vote-btn {
      padding: 0.75rem;
      font-size: 1.1rem;
      font-weight: bold;
      background: #4CAF50;
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
      transition: transform 0.1s, background-color 0.2s;
    }

    .vote-btn:hover {
      background: #45a049;
      transform: translateY(-1px);
    }

    .vote-btn:active {
      transform: translateY(0);
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class VoteCreationComponent {
  private votesService = inject(VotesService);
  private roomsService = inject(RoomsService);
  private keycloak = inject(KeycloakService);

  readonly voteValues = ['1', '2', '3', '5', '8', '13', '21', '?'];
  readonly votes = this.votesService.votesList;

  trackValue(index: number, value: string): string {
    return value;
  }

  async submitVote(value: string): Promise<void> {
    const roomId = this.roomsService.currentRoomValue()?.id;
    if (!roomId) {
      console.error('No room selected');
      return;
    }
    
    // Convert '?' to -1 for the backend
    const numericValue = value === '?' ? -1 : parseInt(value, 10);
    this.votesService.createVote(roomId, numericValue);
  }
}