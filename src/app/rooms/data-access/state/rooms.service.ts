import { Injectable, computed, signal } from '@angular/core';
import { RoomResponse } from '../../../shared/types/vote.types';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {
  private readonly rooms = signal<RoomResponse[]>([]);
  private readonly currentRoom = signal<RoomResponse | null>(null);
  private readonly loading = signal<boolean>(false);
  private readonly error = signal<string | null>(null);

  // Computed values
  readonly roomsList = computed(() => this.rooms());
  readonly currentRoomValue = computed(() => this.currentRoom());
  readonly isLoading = computed(() => this.loading());
  readonly errorMessage = computed(() => this.error());

  constructor(private http: HttpClient) {}

  loadRooms() {
    this.loading.set(true);
    this.error.set(null);
    
    this.http.get<RoomResponse[]>(`${environment.apiUrl}/api/rooms`).subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  setCurrentRoom(room: RoomResponse) {
    this.currentRoom.set(room);
  }

  createRoom(name: string) {
    this.loading.set(true);
    this.error.set(null);

    this.http.post<RoomResponse>(`${environment.apiUrl}/api/rooms`, { name }).subscribe({
      next: (room) => {
        this.rooms.update(rooms => [...rooms, room]);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  joinRoom(roomId: string) {
    this.loading.set(true);
    this.error.set(null);

    this.http.post<RoomResponse>(`${environment.apiUrl}/api/rooms/${roomId}/join`, {}).subscribe({
      next: (room) => {
        // Update the current room immediately
        this.currentRoom.set(room);
        // Then refresh the room list
        this.loadRooms();
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  leaveRoom(roomId: string) {
    this.loading.set(true);
    this.error.set(null);

    this.http.post<RoomResponse>(`${environment.apiUrl}/api/rooms/${roomId}/leave`, {}).subscribe({
      next: (room) => {
        // Clear current room if we just left it
        if (this.currentRoomValue()?.id === roomId) {
          this.currentRoom.set(null);
        }
        // Then refresh the room list
        this.loadRooms();
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
}
