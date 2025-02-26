import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiscussionChatComponent } from './discussion/discussion-chat.component';

const routes: Routes = [
  { path: 'discussion', component: DiscussionChatComponent },
  // other routes can be added here
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
