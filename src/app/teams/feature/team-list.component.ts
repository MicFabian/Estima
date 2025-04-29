import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TeamService } from '../data-access/team.service';
import { Team } from '../model/team.model';

@Component({
  selector: 'app-team-list',
  standalone: true,
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    // Angular built-in directives
    // (NgIf, NgFor are included with CommonModule in Angular >=16)
  ]
})
export class TeamListComponent implements OnInit {
  teams: Team[] = [];
  loading = false;
  error = ''; 

  constructor(private teamService: TeamService) {}

  ngOnInit(): void {
    this.loading = true;
    this.teamService.getTeams().subscribe({
      next: teams => {
        this.teams = teams;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load teams', err);
        this.error = 'Failed to load teams. Please try again later.';
        this.loading = false;
      }
    });
  }

  // Helper function to generate color from string
  stringToColor(str: string | undefined): string {
    if (!str) {
      return '#cccccc'; // Default gray for undefined/empty strings
    }
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      // Make colors brighter and less likely to be very dark
      const adjustedValue = Math.floor((value + 255) / 2);
      color += ('00' + adjustedValue.toString(16)).substr(-2);
    }
    return color;
  }
}
