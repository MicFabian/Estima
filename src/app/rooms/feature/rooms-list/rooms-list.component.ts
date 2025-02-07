import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomsService } from '../../data-access/state/rooms.service';
import { RouterModule } from '@angular/router';
import { Room } from '../../../shared/types/room.types';
import { Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-rooms-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <div class="min-h-screen p-4">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Planning Poker</h1>
        <button mat-raised-button color="primary" (click)="showCreateRoom = true">
          <mat-icon>add</mat-icon>
          Create Room
        </button>
      </div>

      <!-- Create Room Dialog -->
      <div *ngIf="showCreateRoom" class="dialog-overlay">
        <mat-card class="dialog-card">
          <mat-card-header>
            <mat-card-title>Create New Room</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field class="w-full">
              <mat-label>Room Name</mat-label>
              <input matInput [(ngModel)]="newRoomName" placeholder="Enter room name">
            </mat-form-field>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-button (click)="showCreateRoom = false">Cancel</button>
            <button mat-raised-button color="primary" 
                    (click)="createRoom()" 
                    [disabled]="!newRoomName.trim()">
              Create Room
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Empty State -->
      @if (!rooms().length) {
        <mat-card class="text-center p-6">
          <mat-icon class="text-6xl mb-4" color="primary">add_circle</mat-icon>
          <h3 class="text-xl font-semibold mb-2">Welcome to Planning Poker</h3>
          <p class="text-gray-600">Create your first room to start estimating stories with your team</p>
        </mat-card>
      }

      <!-- Rooms Grid -->
      @if (rooms().length) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (room of rooms(); track room.id) {
            <mat-card>
              <mat-card-content>
                <div class="flex flex-col gap-4">
                  <div class="flex justify-between items-start">
                    <div>
                      <h2 class="text-xl font-bold mb-2">{{ room.name }}</h2>
                      <div class="flex gap-4 mb-4">
                        <div class="flex items-center gap-2">
                          <mat-icon class="text-indigo-500">description</mat-icon>
                          <span>{{ room.stories.length || 0 }} Stories</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <mat-icon class="text-blue-500">group</mat-icon>
                          <span>{{ room.participants.length || 0 }} {{ room.participants.length === 1 ? 'Member' : 'Members' }}</span>
                        </div>
                        @if (room.currentStory) {
                          <div class="flex items-center gap-2">
                            <mat-icon [class.text-green-500]="room.currentStory.votingActive" 
                                     [class.text-red-500]="!room.currentStory.votingActive">
                              {{ room.currentStory.votingActive ? 'play_circle' : 'pause_circle' }}
                            </mat-icon>
                            <span [class.text-green-500]="room.currentStory.votingActive" 
                                  [class.text-red-500]="!room.currentStory.votingActive">
                              {{ room.currentStory.votingActive ? 'Active' : 'Paused' }}
                            </span>
                          </div>
                        }
                      </div>
                    </div>
                    <div>
                      @if (room.ownerId === getCurrentUserId()) {
                        <button mat-icon-button color="warn" (click)="deleteRoom(room.id)" matTooltip="Delete Room">
                          <mat-icon>delete</mat-icon>
                        </button>
                      } @else {
                        <button mat-icon-button color="warn" (click)="leaveRoom(room.id)" matTooltip="Leave Room">
                          <mat-icon>exit_to_app</mat-icon>
                        </button>
                      }
                    </div>
                  </div>

                  @if (room.currentStory) {
                    <div class="current-story p-3 bg-gray-100 rounded">
                      <div class="flex items-center text-gray-600 mb-2">
                        <mat-icon class="mr-2">schedule</mat-icon>
                        <span class="font-medium">Current Story</span>
                      </div>
                      <p class="m-0">{{ room.currentStory.title }}</p>
                    </div>
                  }

                  <div class="flex justify-end">
                    <button mat-raised-button color="primary" [routerLink]="['/rooms', room.id]">
                      <mat-icon>login</mat-icon>
                      Join Room
                    </button>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .dialog-card {
      width: 450px;
      padding: 24px;
    }
    mat-form-field {
      width: 100%;
    }
    .text-6xl {
      font-size: 4rem;
    }
    :host {
      .text-green-500 {
        color: #10b981;
      }
      .text-red-500 {
        color: #ef4444;
      }
      .text-blue-500 {
        color: #3b82f6;
      }
      .text-indigo-500 {
        color: #6366f1;
      }
    }
  `]
})
export class RoomsListComponent implements OnInit {
  private roomsService = inject(RoomsService);
  readonly rooms: Signal<Room[]> = this.roomsService.rooms;
  
  showCreateRoom = false;
  newRoomName = '';

  ngOnInit(): void {
    this.loadRooms();
  }

  getCurrentUserId(): string {
    return this.roomsService.getCurrentUserId();
  }

  async loadRooms(): Promise<void> {
    await this.roomsService.loadRooms();
  }

  async createRoom(): Promise<void> {
    if (!this.newRoomName.trim()) return;
    
    await this.roomsService.createRoom(this.newRoomName);
    this.newRoomName = '';
    this.showCreateRoom = false;
  }

  async deleteRoom(roomId: string): Promise<void> {
    if (confirm('Are you sure you want to delete this room?')) {
      await this.roomsService.deleteRoom(roomId);
    }
  }

  async leaveRoom(roomId: string): Promise<void> {
    if (confirm('Are you sure you want to leave this room?')) {
      await this.roomsService.leaveRoom(roomId);
    }
  }
}
