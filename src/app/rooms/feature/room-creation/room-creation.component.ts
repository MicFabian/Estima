import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomsService } from '../../data-access/state/rooms.service';

@Component({
  selector: 'app-room-creation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-creation.component.html',
  styleUrls: ['./room-creation.component.scss']
})
export class RoomCreationComponent {
  private roomsService = inject(RoomsService);

  showModal = signal<boolean>(false);
  roomName = signal<string>('');
  error = signal<string | null>(null);

  toggleModal(): void {
    this.showModal.update(v => !v);
    // Reset form when opening or closing
    this.roomName.set('');
    this.error.set(null);
  }

  createRoom(): void {
    const name = this.roomName().trim();
    if (!name) {
      this.error.set('Room name is required');
      return;
    }

    this.roomsService.createRoom(name)
      .then(() => {
        this.toggleModal();
      })
      .catch(err => {
        this.error.set(err.message || 'Failed to create room');
      });
  }
}