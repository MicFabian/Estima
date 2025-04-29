import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, RoomRequest } from './room.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private readonly baseUrl = `${environment.apiUrl}/api/rooms`;

  constructor(private http: HttpClient) { }

  /**
   * Get all rooms
   */
  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.baseUrl);
  }

  /**
   * Get rooms by team ID
   */
  getRoomsByTeamId(teamId: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.baseUrl}/by-team/${teamId}`);
  }

  /**
   * Get a room by ID
   */
  getRoomById(roomId: string): Observable<Room> {
    return this.http.get<Room>(`${this.baseUrl}/${roomId}`);
  }

  /**
   * Create a new room
   */
  createRoom(roomRequest: RoomRequest): Observable<Room> {
    return this.http.post<Room>(this.baseUrl, roomRequest);
  }

  /**
   * Join a room
   */
  joinRoom(roomId: string): Observable<Room> {
    return this.http.post<Room>(`${this.baseUrl}/${roomId}/join`, {});
  }

  /**
   * Leave a room
   */
  leaveRoom(roomId: string): Observable<Room> {
    return this.http.post<Room>(`${this.baseUrl}/${roomId}/leave`, {});
  }

  /**
   * Close a room (only owner)
   */
  closeRoom(roomId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${roomId}`);
  }
}
