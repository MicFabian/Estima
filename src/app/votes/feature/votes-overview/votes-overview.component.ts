import { Component, Input, computed, inject, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { VotesService } from '../../data-access/state/votes.service';
import { RoomsService } from '../../../rooms/data-access/state/rooms.service';
import { Story } from '../../../shared/types/room.types';
import { EstimationCompleteDialogComponent } from '../estimation-complete-dialog/estimation-complete-dialog.component';

@Component({
  selector: 'app-votes-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule
  ],
  template: `
    <div class="votes-overview">
      <mat-card>
        <mat-card-content>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Votes Overview</h2>
            @if (isAdmin() && allReady()) {
              <button mat-raised-button color="primary" 
                      (click)="startResolution()"
                      [disabled]="isResolvingVotes()">
                Discuss & Resolve
              </button>
            }
          </div>

          @if (hasVotes()) {
            <div class="votes-grid">
              @for (vote of votes(); track vote.userId) {
                <div class="vote-card" [class.revealed]="isVoteRevealed(vote)">
                  <div class="vote-front">
                    @if (vote.ready) {
                      <mat-icon class="text-green-500">check_circle</mat-icon>
                    } @else {
                      <mat-icon class="text-blue-500">how_to_vote</mat-icon>
                    }
                  </div>
                  <div class="vote-back">
                    {{ formatVoteValue(vote.value) }}
                    @if (isCurrentUser(vote.userId)) {
                      <button mat-icon-button class="ready-button" 
                              (click)="toggleReady(vote)"
                              [class.ready]="vote.ready"
                              matTooltip="{{ vote.ready ? 'Mark as not ready' : 'Mark as ready' }}">
                        <mat-icon>{{ vote.ready ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                      </button>
                    }
                  </div>
                </div>
              }
            </div>

            <div class="flex justify-center mt-4">
              @if (!isCurrentUserReady()) {
                <button mat-raised-button 
                        color="primary"
                        (click)="markAsReady()"
                        [disabled]="!hasCurrentUserVoted()">
                  Mark as Ready
                </button>
              } @else {
                <button mat-stroked-button 
                        color="warn"
                        (click)="markAsNotReady()">
                  Change Vote
                </button>
              }
            </div>

            @if (canRevealVotes()) {
              <mat-divider class="my-4"></mat-divider>
              
              @if (isResolvingVotes()) {
                <div class="resolution-phase">
                  <h3 class="text-lg font-semibold mb-3">Choose Final Estimate</h3>
                  <div class="resolution-options">
                    @for (value of getUniqueVotes(); track value) {
                      <button mat-stroked-button
                              [class.selected]="value === selectedValue()"
                              (click)="selectValue(value)"
                              class="estimate-option">
                        {{ formatVoteValue(value) }}
                        <span class="vote-count">
                          {{ getVoteCount(value) }} {{ getVoteCount(value) === 1 ? 'vote' : 'votes' }}
                        </span>
                      </button>
                    }
                  </div>
                  
                  <div class="resolution-actions mt-4">
                    @if (selectedValue() !== null) {
                      <button mat-raised-button 
                              color="primary"
                              (click)="finalizeVoting()"
                              class="mr-2">
                        Agree on {{ formatVoteValue(selectedValue()) }}
                      </button>
                    }
                    <button mat-stroked-button
                            color="warn"
                            (click)="startNewRound()">
                      Start New Round
                    </button>
                  </div>
                </div>
              } @else {
                <div class="results">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600">Total Votes:</span>
                    <span class="font-semibold">{{ voteStats().totalVotes }}</span>
                  </div>
                  <div class="flex justify-between items-center mt-2">
                    <span class="text-gray-600">Ready:</span>
                    <span class="font-semibold">{{ getReadyCount() }} / {{ getTotalParticipants() }}</span>
                  </div>
                  <div class="flex justify-between items-center mt-2">
                    <span class="text-gray-600">Average Estimate:</span>
                    <span class="font-semibold">{{ formatVoteValue(voteStats().averageVote) }}</span>
                  </div>
                </div>
              }
            }
          } @else {
            <div class="text-center text-gray-500 py-8">
              <mat-icon class="text-6xl mb-4">how_to_vote</mat-icon>
              <p>No votes submitted yet</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .votes-overview {
      margin-top: 1rem;
    }
    .votes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }
    .vote-card {
      position: relative;
      width: 80px;
      height: 100px;
      perspective: 1000px;
      cursor: default;
    }
    .vote-front, .vote-back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      transition: transform 0.6s;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .vote-back {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      font-size: 1.5rem;
      font-weight: bold;
      transform: rotateY(180deg);
    }
    .vote-card.revealed .vote-front {
      transform: rotateY(180deg);
    }
    .vote-card.revealed .vote-back {
      transform: rotateY(0);
    }
    .text-6xl {
      font-size: 4rem;
    }
    .resolution-phase {
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
    }
    .resolution-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .estimate-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.75rem 1rem;
      min-width: 80px;
    }
    .estimate-option.selected {
      background: #818cf8;
      color: white;
    }
    .vote-count {
      font-size: 0.75rem;
      margin-top: 0.25rem;
      opacity: 0.8;
    }
  `]
})
export class VotesOverviewComponent {
  @Input() story!: Story;

  private votesService = inject(VotesService);
  private roomsService = inject(RoomsService);
  private dialog = inject(MatDialog);

  readonly votes = this.votesService.votesList;
  readonly resolvingVotes = signal(false);
  readonly selectedValue = signal<string | null>(null);
  readonly votesRevealed = computed(() => {
    // Votes should be revealed if any of these conditions are true:
    // 1. The voting is not active (stopped/paused)
    // 2. Story has an estimate already
    // 3. In resolving votes mode
    // 4. Admin user is viewing
    return !this.story?.votingActive || 
           this.story?.estimate !== null || 
           this.resolvingVotes() || 
           this.isAdmin();
  });
  readonly isAdmin = computed(() => this.roomsService.isOwner());

  readonly voteStats = computed(() => {
    const votes = this.votes();
    if (!votes.length) return { totalVotes: 0, averageVote: '' };

    const validVotes = votes.filter(v => v.value !== '-1' && v.value !== '?');
    const total = validVotes.reduce((sum, v) => sum + parseFloat(v.value), 0);
    
    return {
      totalVotes: votes.length,
      averageVote: validVotes.length ? (total / validVotes.length).toFixed(1) : ''
    };
  });

  // Track previous story ID to detect changes
  private previousStoryId: string | null = null;

  ngOnChanges(changes: SimpleChanges) {
    // If story input changes, reload votes
    if (changes['story'] && this.story) {
      const currentStoryId = this.story.id;
      const previousStoryId = this.previousStoryId;
      
      // Only reload if story ID changed or if we're in discussion phase
      if (currentStoryId !== previousStoryId || 
          this.story.votingPhase === 'DISCUSSING') {
        console.log('Story changed or in discussion phase, reloading votes');
        this.loadVotesForStory();
        this.previousStoryId = currentStoryId;
      }
    }
  }

  private loadVotesForStory() {
    if (this.story) {
      const room = this.roomsService.currentRoom();
      if (room) {
        console.log('Loading votes for story:', this.story.id);
        this.votesService.getVotesForStory(room.id, this.story.id).subscribe({
          next: (votes) => {
            console.log('Votes loaded in VotesOverviewComponent:', votes.length);
            // No need to manually update votes as getVotesForStory already does this internally
          },
          error: (err) => console.error('Failed to load votes:', err)
        });
      }
    }
  }

  hasVotes(): boolean {
    return this.votes().length > 0;
  }

  allReady(): boolean {
    const room = this.roomsService.currentRoom();
    if (!room) return false;
    const votes = this.votes();
    return votes.length === room.participants.length && votes.every(v => v.ready);
  }

  isResolvingVotes(): boolean {
    return this.resolvingVotes();
  }

  formatVoteValue(value: string | null): string {
    if (value === null) return '';
    return value === '-1' ? '?' : value;
  }

  startResolution(): void {
    this.resolvingVotes.set(true);
    // Use moveToDiscussion instead of pauseVoting to properly transition to discussion phase
    this.roomsService.moveToDiscussion(this.story.id)
      .then(() => {
        // Explicitly reload votes after moving to discussion
        this.loadVotesForStory();
      })
      .catch(error => {
        console.error('Failed to start discussion phase', error);
        // Fallback to just pausing voting if discussion transition fails
        this.roomsService.pauseVoting(this.story.id);
      });
  }

  getUniqueVotes(): string[] {
    return Array.from(new Set(this.votes().map(v => v.value)))
      .filter(v => v !== '-1' && v !== '?')
      .sort((a, b) => parseFloat(a) - parseFloat(b));
  }

  getVoteCount(value: string): number {
    return this.votes().filter(v => v.value === value).length;
  }

  selectValue(value: string): void {
    this.selectedValue.set(value);
  }

  finalizeVoting(): void {
    const stats = this.calculateStats();
    const averageVoteNumber = parseFloat(stats.averageVote.toFixed(1));
    
    this.roomsService.finalizeVoting(this.story.id, averageVoteNumber).then(() => {
      // Show the estimation complete dialog
      const room = this.roomsService.currentRoom();
      if (room) {
        this.dialog.open(EstimationCompleteDialogComponent, {
          width: '480px',
          disableClose: true,
          data: {
            storyId: this.story.id,
            roomId: room.id,
            storyTitle: this.story.title,
            estimateValue: averageVoteNumber
          }
        });
      }
    });
  }

  startNewRound(): void {
    this.roomsService.startNewVotingRound(this.story.id);
    this.resolvingVotes.set(false);
    this.selectedValue.set(null);
  }

  getReadyCount(): number {
    return this.votes().filter(v => v.ready).length;
  }

  getTotalParticipants(): number {
    const room = this.roomsService.currentRoom();
    return room?.participants.length || 0;
  }

  hasCurrentUserVoted(): boolean {
    const userId = this.roomsService.getCurrentUserId();
    return this.votes().some(v => v.userId === userId);
  }

  isCurrentUserReady(): boolean {
    const userId = this.roomsService.getCurrentUserId();
    return this.votes().some(v => v.userId === userId && v.ready);
  }

  canRevealVotes(): boolean {
    // Reveal votes when:
    // 1. Voting is not active, or
    // 2. The current user is an admin
    // Note: Individual votes can still be revealed based on their ready state
    return !this.story?.votingActive || this.isAdmin();
  }

  isVoteRevealed(vote: any): boolean {
    // A vote is revealed if:
    // 1. Voting is not active (all votes are revealed), or
    // 2. The current user is an admin (can see all votes), or
    // 3. The vote is marked as ready (ready votes are always revealed), or
    // 4. The vote belongs to the current user (users can always see their own votes)
    return !this.story?.votingActive || 
           this.isAdmin() || 
           vote.ready || 
           this.isCurrentUser(vote.userId);
  }

  markAsReady(): void {
    const userVote = this.votes().find(v => v.userId === this.roomsService.getCurrentUserId());
    if (userVote) {
      this.votesService.markVoteAsReady(userVote.id, true).subscribe();
    }
  }

  markAsNotReady(): void {
    const userVote = this.votes().find(v => v.userId === this.roomsService.getCurrentUserId());
    if (userVote) {
      this.votesService.markVoteAsReady(userVote.id, false).subscribe();
    }
  }

  isCurrentUser(userId: string): boolean {
    return userId === this.votesService.getCurrentUserId();
  }

  toggleReady(vote: { id: string; ready: boolean }): void {
    this.votesService.markVoteAsReady(vote.id, !vote.ready).subscribe();
  }

  calculateStats(): { totalVotes: number; averageVote: number } {
    const votes = this.votes();
    if (!votes.length) return { totalVotes: 0, averageVote: 0 };

    const validVotes = votes.filter(v => v.value !== '-1' && v.value !== '?');
    const total = validVotes.reduce((sum, v) => sum + parseFloat(v.value), 0);
    
    return {
      totalVotes: votes.length,
      averageVote: validVotes.length ? total / validVotes.length : 0
    };
  }
}
