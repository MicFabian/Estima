import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { VoteResponse } from '../../../shared/types/vote.types';

@Injectable({
  providedIn: 'root'
})
export class VotesService {
  private readonly votes = signal<VoteResponse[]>([]);
  private readonly loading = signal<boolean>(false);
  private readonly error = signal<string | null>(null);
  private readonly currentRoomId = signal<string | null>(null);

  // Computed values
  readonly votesList = computed(() => this.votes());
  readonly isLoading = computed(() => this.loading());
  readonly errorMessage = computed(() => this.error());
  readonly currentRoomVotes = computed(() => {
    const roomId = this.currentRoomId();
    return roomId ? this.votes().filter(vote => vote.roomId === roomId) : [];
  });

  constructor(private http: HttpClient) {}

  loadVotesByRoom(roomId: string) {
    this.loading.set(true);
    this.error.set(null);
    this.currentRoomId.set(roomId);

    this.http.get<VoteResponse[]>(`${environment.apiUrl}/api/votes/room/${roomId}`).subscribe({
      next: (votes) => {
        this.votes.set(votes);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  createVote(roomId: string, value: number) {
    this.loading.set(true);
    this.error.set(null);

    this.http.post<VoteResponse>(`${environment.apiUrl}/api/votes`, { roomId, value }).subscribe({
      next: (vote) => {
        this.votes.update(votes => [...votes, vote]);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  clearVotes(roomId: string) {
    this.loading.set(true);
    this.error.set(null);

    this.http.delete(`${environment.apiUrl}/api/votes/room/${roomId}`).subscribe({
      next: () => {
        this.votes.set([]);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
}
