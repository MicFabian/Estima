import { Routes } from '@angular/router';
import { RoomsListComponent } from './rooms-list/rooms-list.component';
import { RoomViewComponent } from './room-view/room-view.component';
import { VotingComponent } from './voting/voting.component';

export const ROOMS_ROUTES: Routes = [
  { path: 'rooms', component: RoomsListComponent },
  { path: 'rooms/:roomId', component: RoomViewComponent },
  { path: 'rooms/:roomId/voting/:storyId', component: VotingComponent }
];
