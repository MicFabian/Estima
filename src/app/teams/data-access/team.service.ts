import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team, CreateTeamRequest, TeamMemberRequest } from '../model/team.model';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private apiUrl = 'http://localhost:8080/api/teams'; // Use full backend URL

  constructor(private http: HttpClient) {}

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  getTeamById(teamId: string): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/${teamId}`);
  }

  createTeam(request: CreateTeamRequest): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, request);
  }

  addMember(teamId: string, member: TeamMemberRequest): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}/${teamId}/members`, member);
  }

  removeMember(teamId: string, userId: string): Observable<Team> {
    return this.http.delete<Team>(`${this.apiUrl}/${teamId}/members/${userId}`);
  }
}
