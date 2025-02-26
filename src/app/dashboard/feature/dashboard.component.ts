import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomsService } from '../../rooms/data-access/state/rooms.service';
import { Room } from '../../shared/types/room.types';
import { VoteCreationComponent } from '../../votes/feature/vote-creation/vote-creation.component';
import { VotesHistoryComponent } from '../../votes/feature/votes-history/votes-history.component';
import { RoomCreationComponent } from '../../rooms/feature/room-creation/room-creation.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    VoteCreationComponent,
    VotesHistoryComponent,
    RoomCreationComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private roomsService = inject(RoomsService);

  readonly rooms = this.roomsService.roomsList;
  readonly currentRoom = this.roomsService.currentRoom;
  readonly isLoading = this.roomsService.isLoading;
  readonly error = this.roomsService.errorMessage;

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.roomsService.loadRooms();
  }

  joinRoom(roomId: string): void {
    this.roomsService.joinRoom(roomId);
  }

  leaveRoom(roomId: string): void {
    this.roomsService.leaveRoom(roomId);
  }

  selectRoom(room: Room): void {
    if (room.id !== this.currentRoom()?.id) {
      this.roomsService.setCurrentRoom(room);
    }
  }
}