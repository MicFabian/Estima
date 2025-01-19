import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { firstValueFrom } from 'rxjs';
import { Vote } from '../model/vote.model';

@Injectable({
  providedIn: 'root'
})
export class VotesService {
  constructor(private http: HttpClient, private store: Store) {}

  getVotes(): Promise<Vote> {
    const baseUrl = this.store.selectSnapshot((state) => state.config?.baseUrl); // Replace `config?.baseUrl` with your actual state key if different
    const apiEndpoint = `${baseUrl}/api/votes`;
    return firstValueFrom(
      this.http.get<Vote>(apiEndpoint)
    )
      .catch((error) => {
        console.error('Failed to load votes:', error);
        return Promise.reject(error);
      });
  }
}