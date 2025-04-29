import { UUID } from 'angular2-uuid';

export interface Room {
  id: string;
  name: string;
  ownerId: string;
  participants: string[];
  stories?: StoryResponse[];
  currentStoryId?: string;
  currentStory?: StoryResponse;
  teamId?: string;
  teamName?: string;
}

export interface StoryResponse {
  id: string;
  title: string;
  description?: string;
  estimate?: number;
  votingActive: boolean;
  votingPhase: string;
}

export interface RoomRequest {
  name: string;
  teamId?: string;
}
