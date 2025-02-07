import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { VoteResponse, CreateVoteRequest, UpdateVoteRequest } from '../../../shared/types/vote.types';
import { RoomsService } from '../../../rooms/data-access/state/rooms.service';
import { RxStompService } from '@stomp/ng2-stompjs';
import { BehaviorSubject, filter, map, tap, firstValueFrom, switchMap } from 'rxjs';
import { Room } from '../../../shared/types/room.types';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class VotesService {
  private readonly stompClient = inject(RxStompService);
  private readonly http = inject(HttpClient);
  private readonly roomsService = inject(RoomsService);

  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);
  private readonly votes = signal<VoteResponse[]>([]);
  private readonly currentVotesSubject = new BehaviorSubject<VoteResponse[]>([]);

  readonly votesList = this.votes.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly errorMessage = this.error.asReadonly();
  readonly currentVotes$ = this.currentVotesSubject.asObservable();

  constructor() {
    // Convert signal to observable
    toObservable(this.roomsService.currentRoom).pipe(
      filter((room): room is Room => !!room),
    ).subscribe(room => {
      // Subscribe to vote updates
      this.stompClient.watch(`/topic/rooms/${room.id}/votes`).pipe(
        map(message => JSON.parse(message.body) as VoteResponse)
      ).subscribe(vote => {
        const currentVotes = this.currentVotesSubject.value;
        const filteredVotes = currentVotes.filter(v => v.userId !== vote.userId);
        const updatedVotes = [...filteredVotes, vote];
        this.currentVotesSubject.next(updatedVotes);
        this.votes.set(updatedVotes);
      });

      // Subscribe to vote list updates
      this.stompClient.watch(`/topic/rooms/${room.id}/votes/list`).pipe(
        map(message => JSON.parse(message.body) as VoteResponse[])
      ).subscribe(votes => {
        this.currentVotesSubject.next(votes);
        this.votes.set(votes);
      });

      // Fetch votes for active story whenever room changes
      const activeStory = room.stories.find(story => story.votingActive);
      if (activeStory) {
        this.getVotesByRoom(room.id, activeStory.id).subscribe();
      } else {
        // Clear votes if no active story
        this.currentVotesSubject.next([]);
        this.votes.set([]);
      }
    });

    // Also subscribe to story voting status changes
    toObservable(this.roomsService.currentRoom).pipe(
      filter((room): room is Room => !!room),
      switchMap(room => this.stompClient.watch(`/topic/rooms/${room.id}/stories/voting`).pipe(
        map(message => ({ room, story: JSON.parse(message.body) }))
      ))
    ).subscribe(({ room, story }) => {
      if (story.votingActive) {
        // Fetch votes when a story becomes active
        this.getVotesByRoom(room.id, story.id).subscribe();
      } else {
        // Clear votes when voting is stopped
        this.currentVotesSubject.next([]);
        this.votes.set([]);
      }
    });
  }

  async submitVote(storyId: string, value: string): Promise<void> {
    const room = this.roomsService.currentRoom();
    if (!room) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      const request: CreateVoteRequest = {
        roomId: room.id,
        storyId,
        value
      };

      const vote = await firstValueFrom(
        this.http.post<VoteResponse>(
          `${environment.apiUrl}/votes`,
          request
        )
      );

      const currentVotes = this.currentVotesSubject.value;
      const filteredVotes = currentVotes.filter(v => v.userId !== vote.userId);
      const updatedVotes = [...filteredVotes, vote];
      this.currentVotesSubject.next(updatedVotes);
      this.votes.set(updatedVotes);
    } catch (err: any) {
      this.error.set(err.message);
    } finally {
      this.loading.set(false);
    }
  }

  async updateVote(voteId: string, request: UpdateVoteRequest): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const vote = await firstValueFrom(
        this.http.patch<VoteResponse>(
          `${environment.apiUrl}/votes/${voteId}`,
          request
        )
      );

      const currentVotes = this.currentVotesSubject.value;
      const filteredVotes = currentVotes.filter(v => v.id !== vote.id);
      const updatedVotes = [...filteredVotes, vote];
      this.currentVotesSubject.next(updatedVotes);
      this.votes.set(updatedVotes);
    } catch (err: any) {
      this.error.set(err.message);
    } finally {
      this.loading.set(false);
    }
  }

  markVoteAsReady(voteId: string, ready: boolean) {
    this.loading.set(true);
    this.error.set(null);

    const request = {
      value: ready ? 'ready' : 'not_ready'
    };

    return this.http.put<VoteResponse>(
      `${environment.apiUrl}/votes/${voteId}`,
      request
    ).pipe(
      tap({
        next: (response) => {
          this.loading.set(false);
          const currentVotes = this.currentVotesSubject.value;
          const filteredVotes = currentVotes.filter(v => v.id !== response.id);
          const updatedVotes = [...filteredVotes, response];
          this.currentVotesSubject.next(updatedVotes);
          this.votes.set(updatedVotes);
        },
        error: (error) => {
          this.loading.set(false);
          if (error.status === 404) {
            this.error.set('Vote not found. Please try again.');
          } else if (error.status === 400) {
            this.error.set(error.error?.message || 'Failed to update vote. Please ensure voting is active.');
          } else {
            this.error.set('An unexpected error occurred. Please try again.');
          }
          throw error; // Re-throw to allow component to handle
        }
      })
    );
  }

  getVotesByRoom(roomId: string, storyId: string) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<VoteResponse[]>(
      `${environment.apiUrl}/votes/room/${roomId}/story/${storyId}`
    ).pipe(
      tap({
        next: (votes) => {
          this.loading.set(false);
          this.currentVotesSubject.next(votes);
          this.votes.set(votes);
        },
        error: (error) => {
          this.loading.set(false);
          if (error.status === 404) {
            this.error.set('No votes found for this room and story.');
          } else {
            this.error.set('Failed to load votes. Please try again.');
          }
          throw error;
        }
      })
    );
  }

  getCurrentUserId(): string {
    return this.roomsService.getCurrentUserId();
  }
}
