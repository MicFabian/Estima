import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Room, Story } from '../../../shared/types/room.types';
import { KeycloakService } from 'keycloak-angular';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {
  private http = inject(HttpClient);
  private keycloakService = inject(KeycloakService);

  private roomsSignal = signal<Room[]>([]);
  private currentRoomSignal = signal<Room | null>(null);
  private currentStoryIdSignal = signal<string | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  readonly rooms = computed(() => this.roomsSignal());
  readonly currentRoom = computed(() => this.currentRoomSignal());
  readonly currentStoryId = computed(() => this.currentStoryIdSignal());
  readonly isLoading = computed(() => this.loadingSignal());
  readonly errorMessage = computed(() => this.errorSignal());
  readonly roomsList = computed(() => this.roomsSignal());

  getCurrentStoryId(): string | null {
    return this.currentStoryIdSignal();
  }

  getCurrentUserId(): string {
    return this.keycloakService.getKeycloakInstance().subject ?? '';
  }

  readonly isOwner = computed(() => {
    const room = this.currentRoom();
    if (!room) return false;
    const userId = this.keycloakService.getKeycloakInstance().subject;
    return room.ownerId === userId;
  });

  async loadRooms(): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    try {
      const rooms = await firstValueFrom(
        this.http.get<Room[]>(`${environment.apiUrl}/api/rooms`)
      );
      this.roomsSignal.set(rooms);
    } catch (err: any) {
      this.errorSignal.set(err.message);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async createRoom(title: string): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const room = await firstValueFrom(
        this.http.post<Room>(`${environment.apiUrl}/api/rooms`, { name: title })
      );
      this.roomsSignal.update(rooms => [...rooms, room]);
    } catch (err: any) {
      this.errorSignal.set(err.message);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async joinRoom(roomId: string): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const room = await firstValueFrom(
        this.http.post<Room>(`${environment.apiUrl}/api/rooms/${roomId}/join`, {})
      );
      this.currentRoomSignal.set(room);
      
      // Automatically select the current story if it exists and has active voting
      if (room.currentStory?.votingActive) {
        await this.selectStory(room.currentStory.id);
      }
      
      await this.loadRooms();
    } catch (err: any) {
      if (err.status === 404) {
        this.errorSignal.set('Room not found. Please check the room ID and try again.');
      } else {
        this.errorSignal.set(err.message || 'Failed to join room. Please try again.');
      }
      this.loadingSignal.set(false);
      throw err; // Re-throw to allow component to handle the error
    }
  }

  async leaveRoom(roomId: string): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      await firstValueFrom(
        this.http.post<Room>(`${environment.apiUrl}/api/rooms/${roomId}/leave`, {})
      );
      await this.loadRooms();
      if (this.currentRoom()?.id === roomId) {
        this.currentRoomSignal.set(null);
      }
    } catch (err: any) {
      this.errorSignal.set(err.message);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async deleteRoom(roomId: string): Promise<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      await firstValueFrom(
        this.http.delete<void>(`${environment.apiUrl}/api/rooms/${roomId}`)
      );
      this.roomsSignal.update(rooms => rooms.filter(r => r.id !== roomId));
      if (this.currentRoom()?.id === roomId) {
        this.currentRoomSignal.set(null);
      }
    } catch (err: any) {
      this.errorSignal.set(err.message);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  setCurrentRoom(room: Room): void {
    this.currentRoomSignal.set(room);
  }

  setCurrentStoryId(storyId: string | null): void {
    this.currentStoryIdSignal.set(storyId);
  }

  async addStory(story: Omit<Story, 'id' | 'estimate'>): Promise<void> {
    const room = this.currentRoom();
    if (!room) return;

    try {
      const response = await firstValueFrom(
        this.http.post<Room>(`${environment.apiUrl}/api/rooms/${room.id}/stories`, story)
      );
      this.currentRoomSignal.set(response);
      await this.loadRooms();
    } catch (err: any) {
      this.errorSignal.set(err.message);
    }
  }

  async selectStory(storyId: string): Promise<void> {
    const room = this.currentRoom();
    if (!room) return;

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const updatedRoom = await firstValueFrom(
        this.http.post<Room>(
          `${environment.apiUrl}/api/rooms/${room.id}/stories/${storyId}/select`,
          {}
        )
      );

      // Update the story's state in the room
      const updatedStories = updatedRoom.stories.map(story => ({
        ...story
      }));
      
      const newRoom = {
        ...updatedRoom,
        stories: updatedStories,
        currentStory: updatedStories.find(s => s.id === storyId) || null
      };
      
      this.currentRoomSignal.set(newRoom);
      this.setCurrentStoryId(storyId);
      await this.loadRooms();
    } catch (err: any) {
      this.errorSignal.set(err.message);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async removeStory(storyId: string): Promise<void> {
    const room = this.currentRoom();
    if (!room) return;

    try {
      const response = await firstValueFrom(
        this.http.delete<Room>(`${environment.apiUrl}/api/rooms/${room.id}/stories/${storyId}`)
      );
      this.currentRoomSignal.set(response);
      this.setCurrentStoryId(null);
      await this.loadRooms();
    } catch (err: any) {
      this.errorSignal.set(err.message);
    }
  }

  async deleteStory(storyId: string): Promise<void> {
    const room = this.currentRoom();
    if (!room) return;

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const updatedRoom = await firstValueFrom(
        this.http.delete<Room>(`${environment.apiUrl}/api/rooms/${room.id}/stories/${storyId}`)
      );
      this.currentRoomSignal.set(updatedRoom);
      await this.loadRooms();
    } catch (err: any) {
      this.errorSignal.set(err.message);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async finalizeVoting(storyId: string, estimate: number): Promise<void> {
    const room = this.currentRoom();
    if (!room) return;

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const updatedRoom = await firstValueFrom(
        this.http.post<Room>(
          `${environment.apiUrl}/api/rooms/${room.id}/stories/${storyId}/finalize`,
          { estimate }
        )
      );
      this.currentRoomSignal.set(updatedRoom);
      await this.loadRooms();
    } catch (err: any) {
      this.errorSignal.set(err.message);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async startNewVotingRound(storyId: string): Promise<void> {
    const room = this.currentRoom();
    if (!room) return;

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      console.log(`Starting new voting round for story: ${storyId}`);
      const updatedRoom = await firstValueFrom(
        this.http.post<Room>(
          `${environment.apiUrl}/api/rooms/${room.id}/stories/${storyId}/revote`,
          {}
        )
      );
      
      // Update the story's voting state in the room
      const updatedStories = updatedRoom.stories.map(story => ({
        ...story,
        votingActive: story.id === storyId
      }));
      
      const newRoom = {
        ...updatedRoom,
        stories: updatedStories,
        currentStory: updatedStories.find(s => s.id === storyId) || null
      };
      
      this.currentRoomSignal.set(newRoom);
      this.setCurrentStoryId(storyId);
      await this.loadRooms();
    } catch (err: any) {
      console.error('Error starting new voting round:', err);
      this.errorSignal.set(err.message);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async pauseVoting(storyId: string): Promise<void> {
    const room = this.currentRoom();
    if (!room) return;

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const updatedRoom = await firstValueFrom(
        this.http.post<Room>(
          `${environment.apiUrl}/api/rooms/${room.id}/stories/${storyId}/pause-voting`,
          {}
        )
      );
      
      // Update the story's voting state in the room
      const updatedStories = updatedRoom.stories.map(story => ({
        ...story,
        votingActive: story.id === storyId ? false : story.votingActive
      }));
      
      const newRoom = {
        ...updatedRoom,
        stories: updatedStories,
        currentStory: updatedStories.find(s => s.id === storyId) || null
      };
      
      this.currentRoomSignal.set(newRoom);
      await this.loadRooms();
    } catch (err: any) {
      this.errorSignal.set(err.message);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async startVoting(storyId: string): Promise<void> {
    const room = this.currentRoom();
    if (!room) return;

    try {
      const updatedRoom = await firstValueFrom(
        this.http.post<Room>(
          `${environment.apiUrl}/api/rooms/${room.id}/stories/${storyId}/start-voting`,
          {}
        )
      );
      this.currentRoomSignal.set(updatedRoom);
    } catch (err: any) {
      this.errorSignal.set(err.message || 'Failed to start voting.');
      throw err;
    }
  }

  async moveToDiscussion(storyId: string): Promise<void> {
    const room = this.currentRoom();
    if (!room) return;

    try {
      const updatedRoom = await firstValueFrom(
        this.http.post<Room>(
          `${environment.apiUrl}/api/rooms/${room.id}/stories/${storyId}/discuss`,
          {}
        )
      );
      this.currentRoomSignal.set(updatedRoom);
      // Reload all rooms to ensure we have the latest data
      await this.loadRooms();
    } catch (err: any) {
      this.errorSignal.set(err.message || 'Failed to move to discussion phase.');
      throw err;
    }
  }

  async finalizeStory(storyId: string, estimate: number): Promise<void> {
    const room = this.currentRoom();
    if (!room) return;

    try {
      const updatedRoom = await firstValueFrom(
        this.http.post<Room>(
          `${environment.apiUrl}/api/rooms/${room.id}/stories/${storyId}/finalize`,
          { estimate }
        )
      );
      this.currentRoomSignal.set(updatedRoom);
    } catch (err: any) {
      this.errorSignal.set(err.message || 'Failed to finalize story.');
      throw err;
    }
  }
}
