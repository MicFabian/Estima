import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoomsService } from '../../data-access/state/rooms.service';

@Component({
  selector: 'app-room-creation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="room-creation">
      <h3>Create New Room</h3>
      <form [formGroup]="roomForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="title">Room Title</label>
          <input id="title" type="text" formControlName="title" class="form-control" required>
        </div>
        <button type="submit" [disabled]="!roomForm.valid || isLoading()" class="btn btn-primary">
          Create Room
        </button>
      </form>
    </div>
  `,
  styles: [`
    .room-creation {
      margin-top: 2rem;
      padding: 1rem;
      border: 1px solid #dee2e6;
      border-radius: 0.25rem;
      background-color: white;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ced4da;
      border-radius: 0.25rem;
    }
    .btn {
      padding: 0.375rem 0.75rem;
      border-radius: 0.25rem;
      border: 1px solid transparent;
      cursor: pointer;
    }
    .btn-primary {
      background-color: #007bff;
      border-color: #007bff;
      color: white;
    }
    .btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
  `]
})
export class RoomCreationComponent {
  private roomsService = inject(RoomsService);
  private fb = inject(FormBuilder);

  readonly isLoading = this.roomsService.isLoading;

  roomForm: FormGroup = this.fb.group({
    title: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.roomForm.valid) {
      const title = this.roomForm.value.title;
      this.roomsService.createRoom(title);
      this.roomForm.reset();
    }
  }
}