import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Vote, VoteResponse } from '../../../shared/types/vote.types';
import { VotesService } from '../state/votes.service';
import { tap, from } from 'rxjs';

export interface VotesStateModel {
  votes: VoteResponse[];
  currentUserVote: VoteResponse | null;
  readyVotes: VoteResponse[];
  loading: boolean;
  error: string | null;
}

export class LoadVotes {
  static readonly type = '[Votes] Load Votes';
  constructor(public roomId: string, public storyId: string) {}
}

export class SetVotes {
  static readonly type = '[Votes] Set Votes';
  constructor(public votes: VoteResponse[]) {}
}

export class UpdateVote {
  static readonly type = '[Votes] Update Vote';
  constructor(public vote: VoteResponse) {}
}

export class SetVoteReady {
  static readonly type = '[Votes] Set Vote Ready';
  constructor(public voteId: string, public ready: boolean) {}
}

@State<VotesStateModel>({
  name: 'votes',
  defaults: {
    votes: [],
    currentUserVote: null,
    readyVotes: [],
    loading: false,
    error: null
  }
})
@Injectable()
export class VotesState {
  constructor(private votesService: VotesService) {}

  @Selector()
  static votes(state: VotesStateModel): VoteResponse[] {
    return state.votes;
  }

  @Selector()
  static currentUserVote(state: VotesStateModel): VoteResponse | null {
    return state.currentUserVote;
  }

  @Selector()
  static readyVotes(state: VotesStateModel): VoteResponse[] {
    return state.readyVotes;
  }

  @Selector()
  static loading(state: VotesStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: VotesStateModel): string | null {
    return state.error;
  }

  @Action(LoadVotes)
  loadVotes(ctx: StateContext<VotesStateModel>, action: LoadVotes) {
    const state = ctx.getState();
    ctx.patchState({ loading: true });

    return this.votesService.currentVotes$.pipe(
      tap(votes => {
        ctx.patchState({
          votes,
          loading: false,
          error: null
        });
      })
    );
  }

  @Action(SetVotes)
  setVotes(ctx: StateContext<VotesStateModel>, action: SetVotes) {
    ctx.patchState({
      votes: action.votes
    });
  }

  @Action(UpdateVote)
  updateVote(ctx: StateContext<VotesStateModel>, action: UpdateVote) {
    const state = ctx.getState();
    const votes = state.votes.filter(v => v.id !== action.vote.id);
    ctx.patchState({
      votes: [...votes, action.vote]
    });
  }

  @Action(SetVoteReady)
  setVoteReady(ctx: StateContext<VotesStateModel>, action: SetVoteReady) {
    const state = ctx.getState();
    return from(this.votesService.updateVote(action.voteId, { ready: action.ready })).pipe(
      tap(() => {
        const votes = state.votes.map(vote => {
          if (vote.id === action.voteId) {
            return { ...vote, ready: action.ready };
          }
          return vote;
        });
        ctx.patchState({
          votes
        });
      })
    );
  }
}
