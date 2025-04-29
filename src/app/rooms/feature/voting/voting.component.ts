import { Component, OnInit, OnDestroy, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { RoomsService } from '../../data-access/state/rooms.service';
import { VoteService } from '../../data-access/state/vote.service';
import { Story, VotingPhase } from '../../../shared/types/room.types';
import { Vote } from '../../../shared/types/vote.types';
import { RoomEventsService } from '../../data-access/state/room-events.service';
import { VotingCardsComponent } from '../../feature/voting-cards/voting-cards.component';
import { VotesOverviewComponent } from '../../../votes/feature/votes-overview/votes-overview.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    VotingCardsComponent,
    VotesOverviewComponent
  ]
})
export class VotingComponent implements OnInit, OnDestroy {
  // Signals and state
  currentRoom = signal<any | null>(null); // Using any instead of Room since it might have a different structure
  currentStory = signal<Story | null>(null);
  selectedEstimate: string = ''; // Changed from string | null to string to fix type error
  votes = signal<Vote[]>([]);
  VotingPhase = VotingPhase; // For template access

  // Computed values
  storiesToEstimate = computed(() => {
    return this.currentRoom()?.stories || [];
  });

  // Subscriptions
  private subscriptions: Subscription[] = [];
  
  // Inject services
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roomsService = inject(RoomsService);
  private voteService = inject(VoteService);
  private roomEventsService = inject(RoomEventsService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit() {
    // Load room and story data
    this.subscriptions.push(
      this.route.paramMap.subscribe(async params => {
        const roomId = params.get('roomId');
        const storyId = params.get('storyId');
        
        if (roomId) {
          // Wait for room to load before trying to load the story
          await this.loadRoom(roomId);
          
          // Now that room is loaded, find and set the story
          if (storyId) {
            this.loadStory(storyId);

            // Also select the story in the room service to keep state consistent
            this.roomsService.selectStory(storyId).then(() => {
              // After story selection, reload it to ensure we have the latest data
              this.loadStory(storyId);
            });
          }
        }
      })
    );
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Data loading methods
  async loadRoom(roomId: string) {
    try {
      // Join the room to get current state
      await this.roomsService.joinRoom(roomId);
      // Get the current room from the signal
      const room = this.roomsService.currentRoom();
      if (room) {
        this.currentRoom.set(room);
      }
    } catch (error) {
      console.error('Error loading room:', error);
    }
  }

  loadStory(storyId: string) {
    // First try to get the story from the roomsService's currentRoom
    const serviceRoom = this.roomsService.currentRoom();
    console.log('Current room from service:', serviceRoom);
    console.log('Current stories from service:', serviceRoom?.stories);
    if (serviceRoom && serviceRoom.stories) {
      // Try to find the story in the room's stories
      const story = serviceRoom.stories.find(s => s.id === storyId);
      if (story) {
        console.log('Story found in room service:', story);
        this.currentStory.set(story);
        this.currentRoom.set(serviceRoom); // Ensure our local room state is up to date
        this.loadVotes(storyId);
        return;
      }
    }
    
    // Fallback to local room if not found in service
    const room = this.currentRoom();
    if (room && room.stories) {
      const story = room.stories.find(s => s.id === storyId);
      if (story) {
        console.log('Story found in local room:', story);
        this.currentStory.set(story);
        this.loadVotes(storyId);
      } else {
        console.warn(`Story with ID ${storyId} not found in room with ${room.stories.length} stories`);
      }
    } else {
      console.warn('Cannot load story: room or room.stories is undefined');
    }
  }

  loadVotes(storyId: string) {
    const roomId = this.currentRoom()?.id;
    if (roomId) {
      console.log('Loading votes for story:', storyId, 'in room:', roomId);
      this.voteService.getVotesForStory(roomId, storyId).subscribe({
        next: (votes) => {
          console.log('Votes loaded:', votes.length, 'votes found');
          this.votes.set(votes);
        },
        error: (error) => {
          console.error('Error loading votes:', error);
        }
      });
    } else {
      console.error('Cannot load votes: Room ID is missing');
    }
  }

  // Navigation methods
  goBack() {
    const roomId = this.currentRoom()?.id;
    if (roomId) {
      this.router.navigate(['/rooms', roomId]);
    } else {
      this.router.navigate(['/rooms']);
    }
  }

  // Voting control methods
  async startVoting() {
    const story = this.currentStory();
    if (story) {
      try {
        console.log('Starting voting for story:', story.id);
        // Start the voting process
        await this.roomsService.startVoting(story.id);
        
        // Force reload the room data to get updated story state
        const roomId = this.currentRoom()?.id;
        if (roomId) {
          await this.loadRoom(roomId);
          // Reload the specific story again to ensure it has the latest state
          this.loadStory(story.id);
          console.log('Room and story reloaded after starting voting');
        }
      } catch (error) {
        console.error('Error starting voting:', error);
      }
    } else {
      console.error('Cannot start voting: No story selected');
    }
  }

  async stopVoting() {
    const story = this.currentStory();
    if (story) {
      try {
        // Stop voting to reveal votes
        console.log('Stopping voting for story:', story.id);
        await this.roomsService.pauseVoting(story.id);
        
        // Force reload the room data to get updated story state
        const roomId = this.currentRoom()?.id;
        if (roomId) {
          await this.loadRoom(roomId);
          // Reload the specific story again to ensure it has the latest state
          this.loadStory(story.id);
          // Explicitly reload votes to ensure they're shown in the overview
          this.loadVotes(story.id);
          console.log('Room, story, and votes reloaded after stopping voting');
        }
      } catch (error) {
        console.error('Error stopping voting:', error);
      }
    } else {
      console.error('Cannot stop voting: No story selected');
    }
  }

  async moveToDiscussionPhase(storyId: string) {
    this.roomsService.moveToDiscussion(storyId)
      .then(() => {
        // Reload the story to get the updated phase
        this.loadStory(storyId);
        
        // Explicitly reload votes after moving to discussion phase
        this.loadVotes(storyId);
      })
      .catch(error => {
        console.error('Error moving to discussion phase:', error);
        this.snackBar.open('Failed to move to discussion phase', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      });
  }

  async finalizeEstimation(story: Story) {
    // Only proceed if an estimate is selected
    if (!this.selectedEstimate) {
      this.snackBar.open('Please select an estimate value', 'Close', {
        duration: 3000
      });
      return;
    }

    // Convert the selected estimate to a number
    let estimateValue: number;
    try {
      estimateValue = parseFloat(this.selectedEstimate);
      if (isNaN(estimateValue)) {
        // Handle special cases like '?' or 'coffee'
        estimateValue = 0;
      }
    } catch (e) {
      estimateValue = 0;
    }

    this.roomsService.finalizeVoting(story.id, estimateValue)
      .then(() => {
        // Reset selected estimate
        this.selectedEstimate = '';
        
        // Reload the story to get the updated phase
        this.loadStory(story.id);
        
        // Explicitly reload votes after finalizing
        this.loadVotes(story.id);
        
        this.snackBar.open('Story estimation finalized', 'Close', {
          duration: 3000
        });
      })
      .catch(error => {
        console.error('Error finalizing estimation:', error);
        this.snackBar.open('Failed to finalize estimation', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      });
  }

  async restartVoting(storyId: string) {
    try {
      await this.roomsService.startNewVotingRound(storyId);
      
      // Reload the story to get the updated phase
      this.loadStory(storyId);
      
      // Explicitly reload votes after restarting
      this.loadVotes(storyId);
      
      this.snackBar.open('Voting restarted', 'Close', {
        duration: 3000
      });
    } catch (error) {
      console.error('Error restarting voting:', error);
      this.snackBar.open('Failed to restart voting', 'Close', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
    }
  }

  // Helper methods
  hasVotingStarted(): boolean {
    const story = this.currentStory();
    return !!story && (story.votingActive || story.votingPhase === VotingPhase.VOTING || story.votingPhase === VotingPhase.DISCUSSING || story.votingPhase === VotingPhase.FINISHED);
  }
  
  hasVotesRevealed(story: Story): boolean {
    // Votes are revealed when voting is not active but we're still in the voting phase
    return !story.votingActive && story.votingPhase === VotingPhase.VOTING;
  }
  
  formatVoteValue(value: string): string {
    // Handle special card values like '?' or 'coffee'
    if (value === '?') return '?';
    if (value === 'coffee') return '☕';
    if (value === 'infinity' || value === '∞') return '∞';
    
    // Handle numeric values
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      // Format whole numbers without decimal places
      if (Math.floor(numericValue) === numericValue) {
        return numericValue.toString();
      }
      // Keep at most 1 decimal place for fractional numbers
      return numericValue.toFixed(1);
    }
    
    return value;
  }
  
  getUserDisplayName(userId: string): string {
    // If current room is available, try to find the user in participants
    const room = this.currentRoom();
    if (room && room.participants) {
      const participant = room.participants.find(p => p.id === userId);
      if (participant) {
        return participant.username;
      }
    }
    
    // Fallback to user ID if no matching participant found
    return userId.substring(0, 8); // Show only first 8 characters of ID as fallback
  }

  isAdmin(): boolean {
    return this.roomsService.isOwner();
  }

  // Helper methods to calculate vote statistics
  getAverageVote(): string {
    const votes = this.votes();
    if (!votes || votes.length === 0) return '0';
    
    // Filter out non-numeric votes like '?'
    const numericVotes = votes.filter(v => !isNaN(parseFloat(v.value)));
    if (numericVotes.length === 0) return '0';
    
    // Calculate average
    const sum = numericVotes.reduce((acc, vote) => acc + parseFloat(vote.value), 0);
    const average = sum / numericVotes.length;
    
    // Format to at most 1 decimal place
    return average.toFixed(1);
  }
  
  getMostCommonVote(): string {
    const votes = this.votes();
    if (!votes || votes.length === 0) return '-';
    
    // Count occurrences of each vote value
    const voteCounts = new Map<string, number>();
    votes.forEach(vote => {
      const value = vote.value;
      voteCounts.set(value, (voteCounts.get(value) || 0) + 1);
    });
    
    // Find the most common vote
    let mostCommonVote = '';
    let maxCount = 0;
    
    voteCounts.forEach((count, value) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonVote = value;
      }
    });
    
    return this.formatVoteValue(mostCommonVote);
  }
  
  getUniqueVoteValues(): string[] {
    const votes = this.votes();
    if (!votes || votes.length === 0) return [];
    
    // Get unique vote values
    const uniqueValues = Array.from(new Set(votes.map(v => v.value)));
    
    // Sort numeric values
    return uniqueValues.sort((a, b) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      
      if (isNaN(numA) && isNaN(numB)) return a.localeCompare(b);
      if (isNaN(numA)) return 1;
      if (isNaN(numB)) return -1;
      
      return numA - numB;
    });
  }
  
  getVoteRange(): string {
    const votes = this.votes();
    if (!votes || votes.length === 0) return '-';
    
    // Filter out non-numeric votes
    const numericVotes = votes
      .map(v => parseFloat(v.value))
      .filter(v => !isNaN(v));
    
    if (numericVotes.length === 0) return '-';
    
    const min = Math.min(...numericVotes);
    const max = Math.max(...numericVotes);
    
    if (min === max) return min.toString();
    return `${min} - ${max}`;
  }
  
  getConsensusLevel(story: Story): number {
    const votes = this.votes();
    if (!votes || votes.length <= 1) return 1; // Perfect consensus with 0 or 1 vote
    
    // Count occurrences of each vote value
    const voteCounts = new Map<string, number>();
    votes.forEach(vote => {
      voteCounts.set(vote.value, (voteCounts.get(vote.value) || 0) + 1);
    });
    
    // Find the most common vote count
    const maxCount = Math.max(...Array.from(voteCounts.values()));
    
    // Calculate consensus level (0 to 1)
    return maxCount / votes.length;
  }
  
  getConsensusText(story: Story): string {
    const level = this.getConsensusLevel(story);
    
    if (level >= 0.8) return 'High Consensus';
    if (level >= 0.5) return 'Moderate Consensus';
    return 'Low Consensus';
  }
  
  getVoteCountForValue(value: string): number {
    return this.votes().filter(vote => vote.value === value).length;
  }

  selectEstimate(value: string) {
    this.selectedEstimate = value;
  }

  stringToColor(str: string): string {
    if (!str) return '#607d8b'; // Default to a material blue gray
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to hex color
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    
    return color;
  }
}
