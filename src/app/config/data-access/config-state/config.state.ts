import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

export class SetConfig {
  static readonly type = '[Config] Set Config';
}

export interface ConfigStateModel {
  keycloakUrl: string;
  realm: string;
  clientId: string;
}

@State<ConfigStateModel>({
  name: 'config',
  defaults: {
    keycloakUrl: 'http://localhost:8081',
    realm: 'estima-realm',
    clientId: 'angular-client'
  }
})
@Injectable()
export class ConfigState {
  @Selector()
  static keycloakUrl(state: ConfigStateModel): string {
    return state.keycloakUrl;
  }

  @Selector()
  static realm(state: ConfigStateModel): string {
    return state.realm;
  }

  @Selector()
  static clientId(state: ConfigStateModel): string {
    return state.clientId;
  }

  @Action(SetConfig)
  setConfig(ctx: StateContext<ConfigStateModel>) {
    // Config is already set in defaults
    return;
  }
}
