import { Component, inject, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { VotingCardsComponent } from '../voting-cards/voting-cards.component';
import { VotesOverviewComponent } from '../../../votes/feature/votes-overview/votes-overview.component';
import { VoteService } from '../../data-access/state/vote.service';
import { Story } from '../../../shared/types/room.types';
import { Vote } from '../../../shared/types/vote.types';
import { ActivatedRoute } from '@angular/router';
import { AddStoryDialogComponent } from '../add-story-dialog/add-story-dialog.component';
import { RoomsService } from '../../data-access/state/rooms.service';

@Component({
  selector: 'app-room-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatDialogModule,
    MatTooltipModule,
    VotingCardsComponent,
    VotesOverviewComponent
  ],
  template: `
    <div class="room-view">
      @if (currentRoom(); as room) {
        <mat-toolbar color="primary">
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-4">
              <button mat-icon-button (click)="goBack()">
                <mat-icon>arrow_back</mat-icon>
              </button>
              <span class="text-xl">{{ room.name }}</span>
            </div>
            <div class="toolbar-actions flex items-center gap-4">
              @if (currentStory() && hasVotingStarted()) {
                @if (isAdmin()) {
                  <button mat-button
                          [color]="currentStory()?.votingActive ? 'warn' : 'primary'"
                          (click)="toggleVoting()">
                    <mat-icon>{{ currentStory()?.votingActive ? 'pause' : 'play_arrow' }}</mat-icon>
                    {{ currentStory()?.votingActive ? 'Pause Voting' : 'Resume Voting' }}
                  </button>
                }
                <div class="flex items-center gap-2">
                  <mat-icon [class.text-green-500]="currentStory()?.votingActive" 
                           [class.text-red-500]="!currentStory()?.votingActive">
                    {{ currentStory()?.votingActive ? 'play_circle' : 'pause_circle' }}
                  </mat-icon>
                  <span [class.text-green-500]="currentStory()?.votingActive" 
                        [class.text-red-500]="!currentStory()?.votingActive">
                    {{ currentStory()?.votingActive ? 'Active' : 'Paused' }}
                  </span>
                </div>
              }
              <div class="flex items-center gap-2">
                <mat-icon class="text-blue-500">group</mat-icon>
                <span>{{ room.participants.length }} {{ room.participants.length === 1 ? 'Member' : 'Members' }}</span>
              </div>
            </div>
          </div>
        </mat-toolbar>

        <div class="room-content">
          <div class="flex flex-col h-[calc(100vh-200px)]">
            <!-- Stories Grid -->
            <div class="stories-grid p-4">
              @for (story of storiesToEstimate(); track story.id) {
                <mat-card 
                  [class.selected]="story.id === currentStory()?.id" 
                  class="story-card cursor-pointer">
                  <mat-card-content>
                    <div class="flex flex-col h-full">
                      <div class="flex justify-between items-center mb-2">
                        <h3 class="text-lg font-semibold">{{ story.title }}</h3>
                        <div class="flex items-center gap-2">
                          @if (story.estimate) {
                            <div class="estimate-badge">
                              {{ story.estimate }}
                            </div>
                          }
                          @if (isAdmin()) {
                            <button mat-icon-button color="warn" 
                                    (click)="deleteStory(story); $event.stopPropagation()" 
                                    matTooltip="Delete Story">
                              <mat-icon>delete</mat-icon>
                            </button>
                          }
                        </div>
                      </div>
                      <p class="text-gray-600 flex-grow">{{ story.description }}</p>
                      <div class="mt-2">
                        <button mat-button color="primary" (click)="selectStory(story)">
                          Select for Voting
                        </button>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              }

              <!-- Add Story Card -->
              @if (isAdmin()) {
                <mat-card (click)="openAddStoryDialog()" 
                         class="story-card cursor-pointer add-story-card">
                  <mat-card-content class="flex items-center justify-center h-full">
                    <div class="text-center">
                      <mat-icon class="text-4xl mb-2">add_circle_outline</mat-icon>
                      <p>Add New Story</p>
                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>

            <!-- Current Story and Voting -->
            <mat-divider></mat-divider>
            
            <div class="p-4 flex-grow">
              @if (currentStory(); as story) {
                <!-- Voting Section -->
                @if (story.votingActive) {
                  <div class="flex flex-col gap-4">
                    <app-voting-cards [story]="story"></app-voting-cards>
                    <app-votes-overview [story]="story"></app-votes-overview>
                  </div>
                } @else {
                  @if (story.estimate !== null) {
                    <div class="results-section">
                      <mat-card>
                        <mat-card-content>
                          <div class="flex items-center justify-between mb-4">
                            <h2 class="text-xl font-semibold">Final Results</h2>
                            @if (isAdmin()) {
                              <button mat-raised-button color="primary" (click)="startNewVotingRound(story.id)">
                                Start New Round
                              </button>
                            }
                          </div>
                          
                          <div class="grid grid-cols-2 gap-4">
                            <div class="result-card">
                              <div class="text-gray-600 mb-2">Final Estimate</div>
                              <div class="estimate-badge text-center">
                                {{ story.estimate }}
                              </div>
                            </div>
                            <div class="result-card">
                              <div class="text-gray-600 mb-2">Consensus</div>
                              <div class="consensus-indicator" 
                                   [class.high]="getConsensusLevel(story) > 0.7"
                                   [class.medium]="getConsensusLevel(story) >= 0.5 && getConsensusLevel(story) <= 0.7"
                                   [class.low]="getConsensusLevel(story) < 0.5">
                                {{ getConsensusText(story) }}
                              </div>
                            </div>
                          </div>

                          <mat-divider class="my-4"></mat-divider>
                          
                          <div class="votes-grid">
                            @for (vote of getVotes(); track vote.userId) {
                              <div class="vote-result">
                                <div class="vote-badge">{{ formatVoteValue(vote.value) }}</div>
                              </div>
                            }
                          </div>
                        </mat-card-content>
                      </mat-card>
                    </div>
                  } @else {
                    <div class="text-center mt-4 p-4 bg-gray-100 rounded">
                      @if (hasVotingStarted()) {
                        <p class="text-gray-600">Voting is paused</p>
                        @if (isAdmin()) {
                          <button mat-raised-button color="primary" class="mt-2" (click)="toggleVoting()">
                            Resume Voting
                          </button>
                        }
                      } @else {
                        <p class="text-gray-600">Voting has not started yet</p>
                        @if (isAdmin()) {
                          <button mat-raised-button color="primary" class="mt-2" (click)="startVoting()">
                            Start Voting
                          </button>
                        }
                      }
                    </div>
                  }
                }
              } @else {
                <div class="text-center text-gray-500">
                  <p>Select a story to start voting</p>
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
      }
    </div>
  `,
  styles: [`
    .room-view {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .toolbar-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .room-content {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
    }
    .stories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .story-card {
      height: 160px;
      transition: all 0.2s ease-in-out;
    }
    .story-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .story-card.selected {
      border: 2px solid var(--mat-primary-500);
      background-color: rgba(var(--mat-primary-500), 0.05);
    }
    .add-story-card {
      border: 2px dashed #ccc;
      background-color: #fafafa;
    }
    .add-story-card:hover {
      border-color: var(--mat-primary-500);
      background-color: #f5f5f5;
    }
    .estimate-badge {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      padding: 4px 12px;
      border-radius: 16px;
      font-weight: 500;
      font-size: 14px;
      box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
    }
    :host {
      mat-toolbar {
        .text-green-500 {
          color: #10b981;
        }
        .text-red-500 {
          color: #ef4444;
        }
        .text-blue-500 {
          color: #3b82f6;
        }
      }
    }
    .results-section {
      padding: 1rem;
    }
    .result-card {
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
      text-align: center;
    }
    .estimate-badge {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 16px;
      font-weight: 600;
      font-size: 1.5rem;
      display: inline-block;
    }
    .consensus-indicator {
      font-weight: 600;
      font-size: 1.25rem;
      padding: 0.5rem;
      border-radius: 8px;
    }
    .consensus-indicator.high {
      background-color: #dcfce7;
      color: #15803d;
    }
    .consensus-indicator.medium {
      background-color: #fef9c3;
      color: #854d0e;
    }
    .consensus-indicator.low {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    .votes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .vote-result {
      text-align: center;
    }
    .vote-badge {
      background: white;
      border: 2px solid #e2e8f0;
      color: #1e293b;
      padding: 0.5rem;
      border-radius: 8px;
      font-weight: 500;
    }
  `]
})
export class RoomViewComponent implements OnInit {
  private roomsService = inject(RoomsService);
  private voteService = inject(VoteService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  readonly currentRoom = this.roomsService.currentRoom;
  readonly currentStory = signal<Story | null>(null);
  readonly storiesToEstimate = computed(() => this.currentRoom()?.stories || []);
  readonly isAdmin = computed(() => this.roomsService.isOwner());

  private currentVotes = signal<Vote[]>([]);

  constructor() {
    this.voteService.currentVotes$.subscribe(votes => {
      this.currentVotes.set(votes);
    });

    // Watch for room changes and update current story accordingly
    effect(() => {
      const room = this.currentRoom();
      if (room?.currentStory) {
        this.currentStory.set(room.currentStory);
        this.loadVotes();
      }
    });
  }

  async ngOnInit(): Promise<void> {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId) {
      await this.roomsService.joinRoom(roomId);
      const room = this.currentRoom();
      if (room?.currentStory) {
        this.currentStory.set(room.currentStory);
        this.loadVotes();
      }
    }
  }

  openAddStoryDialog(): void {
    const dialogRef = this.dialog.open(AddStoryDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.roomsService.addStory(result);
      }
    });
  }

  selectStory(story: Story): void {
    this.currentStory.set(story);
    if (story) {
      this.roomsService.selectStory(story.id);
      this.loadVotes();
    }
  }

  startVoting(): void {
    const story = this.currentStory();
    if (!story) return;
    
    this.roomsService.startVoting(story.id).then(() => {
      this.voteService.clearVotes();
      this.loadVotes();
    });
  }

  startNewVotingRound(storyId: string): void {
    this.roomsService.startVoting(storyId).then(() => {
      this.voteService.clearVotes();
      this.loadVotes();
    });
  }

  deleteStory(story: Story): void {
    this.roomsService.deleteStory(story.id);
  }

  goBack(): void {
    this.router.navigate(['/rooms']);
  }

  getVotes(): Vote[] {
    return this.currentVotes();
  }

  formatVoteValue(value: string): string {
    return value;
  }

  getConsensusLevel(story: Story): number {
    const votes = this.getVotes();
    if (!votes || votes.length === 0) return 0;

    const voteValues = votes.map(v => v.value);
    const mostCommonVote = this.getMostCommonVote(votes);
    const agreementCount = voteValues.filter(v => v === mostCommonVote).length;

    return agreementCount / votes.length;
  }

  getConsensusText(story: Story): string {
    const level = this.getConsensusLevel(story);
    if (level > 0.7) return 'High';
    if (level >= 0.5) return 'Medium';
    return 'Low';
  }

  getMostCommonVote(votes: Vote[]): string {
    if (!votes || votes.length === 0) return '';

    const voteCounts = new Map<string, number>();
    votes.forEach(vote => {
      const count = voteCounts.get(vote.value) || 0;
      voteCounts.set(vote.value, count + 1);
    });

    let maxCount = 0;
    let mostCommonVote = '';
    voteCounts.forEach((count, value) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonVote = value;
      }
    });

    return mostCommonVote;
  }

  hasVotingStarted(): boolean {
    const story = this.currentStory();
    if (!story) return false;
    return story.votingActive || this.getVotes().length > 0;
  }

  toggleVoting(): void {
    const story = this.currentStory();
    if (!story) return;

    if (story.votingActive) {
      this.roomsService.pauseVoting(story.id).then(() => {
        // Refresh votes after pausing
        const votes = this.getVotes();
        if (votes.length > 0) {
          this.calculateStats(votes);
        }
      });
    } else {
      this.roomsService.startVoting(story.id);
    }
  }

  calculateStats(votes: Vote[]): { totalVotes: number; readyCount: number; averageVote: number; consensus: number } {
    const totalVotes = votes.length;
    const readyCount = votes.length;
    const numericVotes = votes.map(v => parseFloat(v.value)).filter(v => !isNaN(v));
    const averageVote = numericVotes.length > 0 ? numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length : 0;
    const mostCommonVote = this.getMostCommonVote(votes);
    const agreementCount = votes.filter(v => v.value === mostCommonVote).length;
    const consensus = totalVotes > 0 ? agreementCount / totalVotes : 0;

    return {
      totalVotes,
      readyCount,
      averageVote,
      consensus
    };
  }

  submitVote(value: string): void {
    const room = this.roomsService.currentRoom();
    const story = this.currentStory();
    if (!room || !story) return;

    const request = {
      roomId: room.id,
      storyId: story.id,
      value
    };

    this.voteService.vote(request).subscribe();
  }

  private loadVotes(): void {
    const room = this.roomsService.currentRoom();
    const story = this.currentStory();
    if (!room || !story) return;

    this.voteService.getVotesForStory(room.id, story.id).subscribe();
  }
}
