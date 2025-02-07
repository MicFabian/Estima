import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Vote, VoteRequest } from '../../../shared/types/vote.types';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VoteService {
  private readonly baseUrl = `${environment.apiUrl}/votes`;
  private currentVotesSubject = new BehaviorSubject<Vote[]>([]);
  currentVotes$ = this.currentVotesSubject.asObservable();

  constructor(private http: HttpClient) {}

  vote(request: VoteRequest): Observable<Vote> {
    return this.http.post<Vote>(this.baseUrl, request).pipe(
      tap(vote => {
        const currentVotes = this.currentVotesSubject.value;
        const index = currentVotes.findIndex(v => v.userId === vote.userId);
        if (index !== -1) {
          currentVotes[index] = vote;
        } else {
          currentVotes.push(vote);
        }
        this.currentVotesSubject.next([...currentVotes]);
      })
    );
  }

  getVotesForStory(roomId: string, storyId: string): Observable<Vote[]> {
    return this.http.get<Vote[]>(`${this.baseUrl}/room/${roomId}/story/${storyId}`).pipe(
      tap(votes => this.currentVotesSubject.next(votes))
    );
  }

  clearVotes(): void {
    this.currentVotesSubject.next([]);
  }
}
