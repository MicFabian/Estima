import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-story-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Add New Story</h2>
    <mat-dialog-content>
      <form [formGroup]="storyForm" class="flex flex-col gap-4">
        <mat-form-field appearance="outline">
          <mat-label>Story Title</mat-label>
          <input matInput formControlName="title" placeholder="Enter story title" required>
          <mat-error *ngIf="storyForm.get('title')?.hasError('required')">
            Title is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" 
                    placeholder="Enter story description" rows="3">
          </textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="!storyForm.valid"
              (click)="onSubmit()">
        Add Story
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1rem;
      min-width: 400px;
    }
    form {
      margin-top: 1rem;
    }
  `]
})
export class AddStoryDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddStoryDialogComponent>);

  storyForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['']
  });

  onSubmit(): void {
    if (this.storyForm.valid) {
      this.dialogRef.close(this.storyForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
