import { Injectable } from '@angular/core';
import { State } from '@ngxs/store';

export interface RoomsStateModel {
  // Add your state model here
}

@State<RoomsStateModel>({
  name: 'rooms',
  defaults: {
    // Add your default state here
  }
})
@Injectable()
export class RoomsState {
  // Add your state logic here
}
