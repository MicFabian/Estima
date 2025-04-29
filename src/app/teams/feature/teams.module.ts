import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { TeamListComponent } from './team-list.component';
import { TeamCreateComponent } from './team-create.component';
import { TeamDetailComponent } from './team-detail.component';

@NgModule({
  declarations: [
    TeamListComponent,
    TeamCreateComponent,
    TeamDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    MatChipsModule
  ],
  exports: [
    TeamListComponent,
    TeamCreateComponent,
    TeamDetailComponent
  ]
})
export class TeamsModule {}
