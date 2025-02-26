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
  templateUrl: './voting-cards.component.html',
  styleUrls: ['./voting-cards.component.scss']
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
