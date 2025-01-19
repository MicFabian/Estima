import { Injectable } from '@angular/core';
import { State } from '@ngxs/store';

export interface VotesStateModel {
  // Add your state model here
}

@State<VotesStateModel>({
  name: 'votes',
  defaults: {
    // Add your default state here
  }
})
@Injectable()
export class VotesState {
  // Add your state logic here
}
