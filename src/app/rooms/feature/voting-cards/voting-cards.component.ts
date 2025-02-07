import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VotesService } from '../../../votes/data-access/state/votes.service';
import { Story } from '../../../shared/types/room.types';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RoomsService } from '../../data-access/state/rooms.service';

@Component({
  selector: 'app-voting-cards',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <div class="voting-cards">
      <mat-card 
        *ngFor="let value of voteValues; trackBy: trackValue"
        class="vote-card" 
        [class.selected]="isSelected(value)"
        (click)="submitVote(value)"
      >
        <mat-card-content>
          {{ value === '?' ? '?' : value }}
        </mat-card-content>
      </mat-card>
    </div>

    <div class="mt-4 text-red-500" *ngIf="errorMessage()">
      {{ errorMessage() }}
    </div>
  `,
  styles: [`
    .voting-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
      gap: 1rem;
      padding: 1rem;
    }
    .vote-card {
      cursor: pointer;
      text-align: center;
      transition: transform 0.2s;
    }
    .vote-card:hover {
      transform: translateY(-5px);
    }
    .vote-card.selected {
      background-color: #e3f2fd;
      border: 2px solid #2196f3;
    }
    mat-card-content {
      font-size: 1.5rem;
      font-weight: bold;
      padding: 1rem;
    }
  `]
})
export class VotingCardsComponent {
  @Input() story!: Story;

  private readonly votesService = inject(VotesService);
  private readonly roomsService = inject(RoomsService);
  readonly votes = this.votesService.votesList;
  readonly errorMessage = this.votesService.errorMessage;

  voteValues = ['1', '2', '3', '5', '8', '13', '21', '?'];

  trackValue(index: number, value: string) {
    return value;
  }

  submitVote(value: string) {
    const voteValue = value === '?' ? '-1' : value;
    this.votesService.submitVote(this.story.id, voteValue);
  }

  isSelected(value: string): boolean {
    const currentUserId = this.roomsService.getCurrentUserId();
    const userVote = this.votes().find(v => v.userId === currentUserId);
    if (!userVote) return false;
    return value === '?' ? userVote.value === '-1' : userVote.value === value;
  }
}
