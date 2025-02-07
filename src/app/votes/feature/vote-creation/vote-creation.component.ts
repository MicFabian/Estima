import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomsService } from '../../../rooms/data-access/state/rooms.service';
import { VotesService } from '../../data-access/state/votes.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-vote-creation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="vote-creation">
      @if (currentRoom()?.currentStory) {
        <form [formGroup]="voteForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="value">Your Vote</label>
            <select id="value" formControlName="value" class="form-control" required>
              <option value="">Select a value</option>
              <option *ngFor="let value of voteValues" [value]="value">{{ value }}</option>
            </select>
          </div>
          <button type="submit" [disabled]="!voteForm.valid || isLoading()" class="btn btn-primary">
            Submit Vote
          </button>
        </form>
      }
      @if (errorMessage()) {
        <div class="alert alert-danger">
          {{ errorMessage() }}
        </div>
      }
    </div>
  `,
  styles: [
    `
      .vote-creation {
        padding: 1rem;
      }
      .form-group {
        margin-bottom: 1rem;
      }
      .form-control {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .btn-primary {
        background-color: #007bff;
        color: white;
      }
      .btn:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
      .alert {
        padding: 1rem;
        margin-top: 1rem;
        border-radius: 4px;
      }
      .alert-danger {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
    `
  ]
})
export class VoteCreationComponent implements OnInit {
  @Input() roomId!: string;
  @Input() storyId!: string;

  private readonly roomsService = inject(RoomsService);
  private readonly votesService = inject(VotesService);
  private readonly fb = inject(FormBuilder);

  readonly currentRoom = this.roomsService.currentRoom;
  readonly isLoading = this.votesService.isLoading;
  readonly errorMessage = this.votesService.errorMessage;

  voteForm: FormGroup;
  voteValues = ['1', '2', '3', '5', '8', '13', '21', '?'];

  ngOnInit() {
    this.voteForm = this.fb.group({
      value: ['', Validators.required]
    });
    if (this.storyId) {
      this.votesService.loadVotesByStory(this.storyId);
    }
  }

  onSubmit() {
    if (this.voteForm.valid && this.roomId && this.storyId) {
      const value = this.voteForm.get('value')?.value;
      this.votesService.createVote(this.roomId, this.storyId, value);
      this.voteForm.reset();
    }
  }
}