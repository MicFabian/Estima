import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  standalone: true
})
export class UserProfileComponent {
  @Input() name!: string;
  @Input() email!: string;
}
