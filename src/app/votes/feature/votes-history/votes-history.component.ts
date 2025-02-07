import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VotesService } from '../../data-access/state/votes.service';

@Component({
  selector: 'app-votes-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="votes-history">
      <h3 class="text-xl font-bold mb-4">Current Votes</h3>
      @if (isLoading()) {
        <p class="text-gray-500">Loading votes...</p>
      } @else if (errorMessage()) {
        <p class="error">{{ errorMessage() }}</p>
      } @else {
        <div class="votes-list">
          @if (votesList().length === 0) {
            <p class="text-gray-500">No votes yet for this story</p>
          } @else {
            @for (vote of votesList(); track vote.userId) {
              <div class="vote-card">
                <div class="vote-info">
                  <span class="user">User: {{ vote.userId }}</span>
                  <span class="vote-value">Vote: {{ vote.value === -1 ? '?' : vote.value }}</span>
                </div>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .votes-history {
      padding: 1rem;
      border: 1px solid #dee2e6;
      border-radius: 0.25rem;
      background-color: white;
      margin-top: 1rem;
    }
    .votes-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .vote-card {
      padding: 1rem;
      border: 1px solid #dee2e6;
      border-radius: 0.25rem;
      background-color: #f8f9fa;
    }
    .vote-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .user {
      font-weight: 500;
    }
    .vote-value {
      font-weight: bold;
      color: #0d6efd;
    }
    .error {
      color: #dc3545;
    }
  `]
})
export class VotesHistoryComponent implements OnInit {
  @Input() storyId!: string;

  private votesService = inject(VotesService);

  readonly votesList = this.votesService.votesList;
  readonly isLoading = this.votesService.isLoading;
  readonly errorMessage = this.votesService.errorMessage;

  ngOnInit(): void {
    if (this.storyId) {
      this.loadVotes();
    }
  }

  private loadVotes(): void {
    console.log('Loading votes for story:', this.storyId);
    this.votesService.loadVotesByStory(this.storyId);
  }
}
