import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomsService } from '../../data-access/state/rooms.service';
import { VotingCardsComponent } from '../voting-cards/voting-cards.component';
import { Story } from '../../../shared/types/room.types';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { VotesHistoryComponent } from '../../../votes/feature/votes-history/votes-history.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-story-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    VotingCardsComponent,
    VotesHistoryComponent,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="story-management">
      @if (isOwner()) {
        <mat-card class="mb-6">
          <mat-card-header>
            <mat-card-title>Add New Story</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="storyForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
              <mat-form-field appearance="outline">
                <mat-label>Story Title</mat-label>
                <input matInput formControlName="title" placeholder="Enter story title" required>
                <mat-error *ngIf="storyForm.get('title')?.hasError('required')">
                  Title is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" placeholder="Enter story description" rows="3">
                </textarea>
              </mat-form-field>

              <div class="flex justify-end">
                <button mat-raised-button color="primary" type="submit" [disabled]="!storyForm.valid">
                  <mat-icon>add</mat-icon>
                  Add Story
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }

      @if (currentRoom()) {
        <!-- Current Story Section -->
        @if (currentRoom()?.currentStory) {
          <mat-card class="mb-6">
            <mat-card-header>
              <mat-card-title>Current Story</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <h3 class="text-xl font-semibold mb-2">{{ currentRoom()?.currentStory?.title }}</h3>
              <p class="text-gray-600 mb-4">{{ currentRoom()?.currentStory?.description }}</p>
              
              @if (currentRoom()?.votingActive) {
                <div class="voting-section">
                  <app-voting-cards 
                    [story]="currentRoom()!.currentStory!"
                  ></app-voting-cards>

                  <app-votes-history
                    [storyId]="currentRoom()!.currentStory!.id"
                  ></app-votes-history>
                </div>
              }
              
              @if (!currentRoom()?.votingActive && currentRoom()?.currentStory?.estimate) {
                <mat-chip-set>
                  <mat-chip color="accent" selected>
                    Final Estimate: {{ currentRoom()?.currentStory?.estimate }}
                  </mat-chip>
                </mat-chip-set>
              }
            </mat-card-content>
          </mat-card>
        }

        <!-- All Stories Section -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>All Stories</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              @for (story of currentRoom()?.stories || []; track story.id) {
                <mat-card [class.selected]="story.id === currentRoom()?.currentStory?.id">
                  <mat-card-content>
                    <h4 class="text-lg font-semibold mb-2">{{ story.title }}</h4>
                    <p class="text-gray-600 mb-4">{{ story.description }}</p>
                    @if (story.estimate) {
                      <mat-chip-set>
                        <mat-chip color="accent" selected>
                          Estimate: {{ story.estimate }}
                        </mat-chip>
                      </mat-chip-set>
                    }
                    @if (isOwner() && story.id !== currentRoom()?.currentStory?.id) {
                      <div class="flex justify-end mt-4">
                        <button mat-raised-button color="primary" (click)="selectStory(story)">
                          <mat-icon>play_arrow</mat-icon>
                          Start Voting
                        </button>
                      </div>
                    }
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .story-management {
      padding: 1rem;
    }
    .selected {
      border: 2px solid var(--mat-primary-500);
    }
    mat-form-field {
      width: 100%;
    }
  `]
})
export class StoryManagementComponent {
  private roomsService = inject(RoomsService);
  private fb = inject(FormBuilder);

  readonly currentRoom = this.roomsService.currentRoom;
  readonly isOwner = this.roomsService.isOwner;

  storyForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['']
  });

  async onSubmit(): Promise<void> {
    if (this.storyForm.valid) {
      await this.roomsService.addStory({
        title: this.storyForm.value.title,
        description: this.storyForm.value.description
      });
      this.storyForm.reset();
    }
  }

  async selectStory(story: Story): Promise<void> {
    await this.roomsService.selectStory(story.id);
  }
}
