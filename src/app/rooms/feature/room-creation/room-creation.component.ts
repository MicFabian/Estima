import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomsService } from '../../data-access/state/rooms.service';
import { VotesService } from '../../../votes/data-access/state/votes.service';

@Component({
  selector: 'app-room-creation',
  templateUrl: './room-creation.component.html',
  styleUrls: ['./room-creation.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RoomCreationComponent {
  private roomsService = inject(RoomsService);
  private votesService = inject(VotesService);

  readonly roomName = signal('');
  readonly showModal = signal(false);
  readonly error = signal('');
  private creating = signal(false);

  createRoom(): void {
    if (this.creating()) {
      return;
    }

    this.error.set('');
    const name = this.roomName().trim();
    if (!name) {
      this.error.set('Room name is required');
      return;
    }

    this.creating.set(true);
    this.roomsService.createRoom(name);
    this.showModal.set(false);
    this.roomName.set('');
    this.creating.set(false);
  }

  toggleModal(): void {
    this.showModal.update(show => !show);
    if (!this.showModal()) {
      this.roomName.set('');
      this.error.set('');
    }
  }
}