import { Component, inject, signal, computed, effect, OnInit, OnDestroy } from '@angular/core';
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
import { Story, VotingPhase } from '../../../shared/types/room.types';
import { Vote } from '../../../shared/types/vote.types';
import { ActivatedRoute } from '@angular/router';
import { AddStoryDialogComponent } from '../add-story-dialog/add-story-dialog.component';
import { RoomsService } from '../../data-access/state/rooms.service';
import { RoomEventsService } from '../../data-access/state/room-events.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  templateUrl: './room-view.component.html',
  styleUrls: ['./room-view.component.scss']
})
export class RoomViewComponent implements OnInit, OnDestroy {
  private roomsService = inject(RoomsService);
  private voteService = inject(VoteService);
  private roomEventsService = inject(RoomEventsService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  readonly currentRoom = this.roomsService.currentRoom;
  readonly currentStory = signal<Story | null>(null);
  readonly storiesToEstimate = computed(() => this.currentRoom()?.stories || []);
  readonly isAdmin = computed(() => this.roomsService.isOwner());
  // Make VotingPhase available in the template
  readonly VotingPhase = VotingPhase;

  private currentVotes = signal<Vote[]>([]);
  private _selectedEstimate: string | null = null;
  get selectedEstimate(): string | null {
    return this._selectedEstimate;
  }
  set selectedEstimate(value: string | null) {
    this._selectedEstimate = value;
  }
  private subscriptions: Subscription[] = [];

  constructor() {
    this.voteService.currentVotes$.subscribe(votes => {
      this.currentVotes.set(votes);
    });

    // Watch for room changes and update current story accordingly
    effect(() => {
      const room = this.currentRoom();
      if (room?.currentStory) {
        this.currentStory.set(room.currentStory);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    // Setup subscription to discussion started events
    this.subscriptions.push(
      this.roomEventsService.discussionStarted$.subscribe(event => {
        if (event) {
          console.log('Discussion started event received', event);
          // Story has moved to discussion phase
          const room = this.currentRoom();
          if (room && event.storyId) {
            this.loadVotesForCurrentStory();
          }
        }
      })
    );
    
    // Subscribe to story deleted events
    this.subscriptions.push(
      this.roomEventsService.storyDeleted$.subscribe(event => {
        if (event) {
          console.log('Story deleted event received in component', event);
          
          // If the current story was deleted, show a message and reset the UI
          const story = this.currentStory();
          if (story && story.id === event.storyId) {
            console.log('Currently selected story was deleted');
            
            // Reset all UI state
            this.currentStory.set(null);
            this.currentVotes.set([]);
            this.selectedEstimate = null;
            
            // Force the router to refresh the view to ensure UI is properly reset
            const currentUrl = this.router.url;
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate([currentUrl]);
            });
            
            // Show a notification to the user
            this.snackBar.open(
              'The current story has been deleted by the room owner', 
              'Dismiss', 
              { duration: 5000 }
            );
          }
        }
      })
    );

    // Load the room on init
    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId) {
      return this.loadRoom(roomId);
    }
    return Promise.resolve();
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
    }
  }

  startVoting(): void {
    const story = this.currentStory();
    if (!story) return;
    
    this.roomsService.startVoting(story.id).then(() => {
      this.voteService.clearVotes();
    });
  }

  startNewVotingRound(storyId: string): void {
    const story = this.currentStory();
    if (!story) {
      console.error('Cannot start new voting round: No current story');
      return;
    }
    
    console.log('Starting new voting round for story:', storyId, 'current phase:', story.votingPhase);
    
    // Get the current room to access its ID
    const room = this.currentRoom();
    if (!room) {
      console.error('Cannot start new voting round: No current room');
      return;
    }
    
    // Clear the votes immediately to update the UI
    this.currentVotes.set([]);
    this.voteService.clearVotes();
    
    if (story && story.votingPhase === VotingPhase.DISCUSSING) {
      // If in discussion phase, use the startNewVotingRound method
      console.log('Using startNewVotingRound method because story is in DISCUSSING phase');
      this.roomsService.startNewVotingRound(storyId).then(() => {
        console.log('New voting round started successfully');
        this.selectedEstimate = null; // Reset selected estimate
        
        this.voteService.getVotesForStory(room.id, storyId).subscribe({
          next: (votes) => {
            this.currentVotes.set(votes);
            console.log('Loaded votes after new round:', votes);
          },
          error: (error) => {
            console.error('Failed to load votes after new round:', error);
          }
        });
      }).catch(error => {
        console.error('Failed to start new voting round:', error);
      });
    } else {
      // Otherwise use the regular startVoting method
      console.log('Using startVoting method because story is NOT in DISCUSSING phase');
      this.roomsService.startVoting(storyId).then(() => {
        console.log('Voting started successfully');
        
        this.voteService.getVotesForStory(room.id, storyId).subscribe({
          next: (votes) => {
            this.currentVotes.set(votes);
            console.log('Loaded votes after starting voting:', votes);
          },
          error: (error) => {
            console.error('Failed to load votes after starting voting:', error);
          }
        });
      }).catch(error => {
        console.error('Failed to start voting:', error);
      });
    }
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

    const uniqueValues = new Set(votes.map(v => v.value)).size;
    const totalVotes = votes.length;
    
    // Simple consensus logic
    if (uniqueValues === 1) {
      return 1;
    } else if (uniqueValues === 2 && totalVotes >= 4) {
      return 0.8;
    } else if (uniqueValues <= 3 && totalVotes >= 5) {
      return 0.6;
    } else {
      return 0;
    }
  }

  getConsensusText(story: Story): string {
    const votes = this.getVotes();
    if (!votes || votes.length === 0) {
      return 'Waiting for votes';
    }
    
    const uniqueValues = new Set(votes.map(v => v.value)).size;
    const totalVotes = votes.length;
    
    // Simple consensus logic
    if (uniqueValues === 1) {
      return 'Perfect Consensus';
    } else if (uniqueValues === 2 && totalVotes >= 4) {
      return 'Strong Consensus';
    } else if (uniqueValues <= 3 && totalVotes >= 5) {
      return 'Moderate Consensus';
    } else {
      return 'No Clear Consensus';
    }
  }

  getMostCommonVote(votes: Vote[]): string {
    if (!votes || votes.length === 0) {
      return 'No votes yet';
    }
    
    // Count occurrences of each value
    const valueCounts = new Map<string, number>();
    for (const vote of votes) {
      const count = valueCounts.get(vote.value) || 0;
      valueCounts.set(vote.value, count + 1);
    }
    
    // Find value with highest count
    let mostCommonValue = '';
    let highestCount = 0;
    
    valueCounts.forEach((count, value) => {
      if (count > highestCount) {
        mostCommonValue = value;
        highestCount = count;
      }
    });
    
    return mostCommonValue || 'No consensus';
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

    console.log('Submitting vote:', request);
    
    this.voteService.vote(request).subscribe({
      next: () => {
        console.log('Vote submitted successfully');
        this.loadVotesForCurrentStory();
      },
      error: (error) => {
        console.error('Failed to submit vote:', error);
      }
    });
  }

  moveToDiscussionPhase(storyId: string): void {
    this.roomsService.moveToDiscussion(storyId)
      .then(() => console.log('Moved to discussion phase'))
      .catch(error => console.error('Failed to move to discussion phase', error));
  }

  finalizeStory(story: Story): void {
    const mostCommonValue = this.getMostCommonVote(this.getVotes());
    const finalEstimate = mostCommonValue ? parseInt(mostCommonValue) : null;
    
    if (finalEstimate !== null) {
      this.roomsService.finalizeStory(story.id, finalEstimate)
        .then(() => {
          console.log('Story finalized with estimate:', finalEstimate);
        })
        .catch(error => {
          console.error('Failed to finalize story', error);
        });
    } else {
      console.error('Cannot finalize story without a valid estimate');
    }
  }

  finalizeStoryWithSelection(story: Story): void {
    const selectedEstimate = this.selectedEstimate;
    if (selectedEstimate !== null) {
      this.roomsService.finalizeStory(story.id, parseInt(selectedEstimate))
        .then(() => {
          console.log('Story finalized with estimate:', selectedEstimate);
        })
        .catch(error => {
          console.error('Failed to finalize story', error);
        });
    } else {
      console.error('Cannot finalize story without a valid estimate');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async loadRoom(roomId: string): Promise<void> {
    await this.roomsService.joinRoom(roomId);
    const room = this.currentRoom();
    if (room?.currentStory) {
      // Handle legacy stories that don't have votingPhase set
      if (!room.currentStory.votingPhase) {
        if (room.currentStory.votingActive) {
          room.currentStory.votingPhase = VotingPhase.VOTING;
        } else if (room.currentStory.estimate !== null) {
          room.currentStory.votingPhase = VotingPhase.FINISHED;
        } else {
          room.currentStory.votingPhase = VotingPhase.VOTING;
        }
      }
      
      this.currentStory.set(room.currentStory);
      
      // Load votes for the current story
      if (room.currentStory.votingActive || room.currentStory.votingPhase === VotingPhase.DISCUSSING) {
        this.voteService.getVotesForStory(room.id, room.currentStory.id).subscribe({
          next: (votes) => {
            this.currentVotes.set(votes);
            console.log('Loaded votes:', votes);
          },
          error: (error) => {
            console.error('Failed to load votes:', error);
          }
        });
      }
    }
  }

  getUserDisplayName(userId: string): string {
    // In a real implementation, this would call a user service
    // to get the user's name based on their ID
    return `User ${userId.substring(0, 4)}`;
  }

  calculateAverageVote(): string {
    const votes = this.getVotes();
    if (!votes || votes.length === 0) return 'No votes yet';

    // Filter out non-numeric votes (like '?')
    const numericVotes = votes
      .map(v => parseFloat(v.value))
      .filter(v => !isNaN(v));
    
    if (numericVotes.length === 0) return 'No numeric votes';
    
    // Calculate the average
    const sum = numericVotes.reduce((a, b) => a + b, 0);
    const avg = sum / numericVotes.length;
    
    // Format to 1 decimal place
    return avg.toFixed(1);
  }

  getVoteRange(): string {
    const votes = this.getVotes();
    if (!votes || votes.length === 0) return 'No votes yet';

    // Filter out non-numeric votes
    const numericVotes = votes
      .map(v => parseFloat(v.value))
      .filter(v => !isNaN(v));
    
    if (numericVotes.length === 0) return 'No numeric votes';
    
    const min = Math.min(...numericVotes);
    const max = Math.max(...numericVotes);
    return `${min} - ${max}`;
  }

  getUniqueVoteValues(): string[] {
    const votes = this.getVotes();
    if (!votes || votes.length === 0) return [];

    const uniqueValues = new Set<string>();
    votes.forEach(vote => uniqueValues.add(vote.value));
    return Array.from(uniqueValues);
  }

  getVoteCountForValue(value: string): number {
    const votes = this.getVotes();
    if (!votes || votes.length === 0) return 0;

    return votes.filter(vote => vote.value === value).length;
  }

  selectEstimate(value: string): void {
    this.selectedEstimate = value;
  }

  loadVotesForCurrentStory(): void {
    const room = this.currentRoom();
    const story = this.currentStory();
    
    if (!room || !story) {
      console.log('Cannot load votes: No current room or story');
      return;
    }
    
    console.log(`Loading votes for story ${story.id} in room ${room.id}`);
    this.voteService.getVotesForStory(room.id, story.id).subscribe({
      next: (votes) => {
        console.log('Loaded votes for current story:', votes);
        this.currentVotes.set(votes);
      },
      error: (error) => {
        console.error('Failed to load votes for current story:', error);
      }
    });
  }
}
