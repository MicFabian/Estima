import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { TeamService } from '../data-access/team.service';
import { CreateTeamRequest } from '../model/team.model';

@Component({
  selector: 'app-team-create',
  standalone: true,
  templateUrl: './team-create.component.html',
  styleUrls: ['./team-create.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatListModule
  ]
})
export class TeamCreateComponent {
  model: CreateTeamRequest = { name: '', description: '' };
  loading = false;
  error = '';

  constructor(private teamService: TeamService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.teamService.createTeam(this.model).subscribe({
      next: team => this.router.navigate(['/teams', team.id]),
      error: err => {
        this.error = 'Failed to create team';
        this.loading = false;
      }
    });
  }
}
