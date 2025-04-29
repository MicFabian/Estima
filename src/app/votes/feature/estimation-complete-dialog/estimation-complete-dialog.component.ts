import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-estimation-complete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './estimation-complete-dialog.component.html',
  styleUrls: ['./estimation-complete-dialog.component.scss']
})
export class EstimationCompleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EstimationCompleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      storyId: string;
      roomId: string;
      storyTitle: string;
      estimateValue: number | string;
    },
    private router: Router
  ) {}

  formatEstimateValue(): string {
    const value = this.data.estimateValue;
    
    // Handle special values
    if (value === 'infinity' || value === '∞') return '∞';
    if (value === 'coffee' || value === '☕') return '☕';
    if (value === '?') return '?';
    
    // Handle numeric values
    if (typeof value === 'number') {
      // Format whole numbers without decimal places
      if (Math.floor(value) === value) {
        return value.toString();
      }
      // Keep at most 1 decimal place for fractional numbers
      return value.toFixed(1);
    }
    
    return value.toString();
  }

  close(): void {
    this.dialogRef.close();
  }

  goToRoomOverview(): void {
    this.dialogRef.close();
    this.router.navigate(['/rooms', this.data.roomId]);
  }

  startNewStory(): void {
    this.dialogRef.close();
    // Stay on the current page but allow for new story selection
  }
}
