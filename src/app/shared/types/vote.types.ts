export interface Vote {
  id: string;
  roomId: string;
  storyId: string;
  userId: string;
  value: string;
  createdAt: string;
  ready: boolean;
}

export interface VoteResponse {
  id: string;
  roomId: string;
  storyId: string;
  userId: string;
  value: string;
  ready: boolean;
  createdAt: string;
}

export interface VoteRequest {
  roomId: string;
  storyId: string;
  value: string;
}

export interface CreateVoteRequest {
  roomId: string;
  storyId: string;
  value: string;
}

export interface UpdateVoteRequest {
  value?: string;
  ready?: boolean;
}

export interface VoteStats {
  totalVotes: number;
  readyCount: number;
  averageVote: number;
  votes: { [key: string]: string };  // userId -> vote value mapping
  revealed: boolean;
}

export interface CreateRoomRequest {
  name: string;
}

export interface Story {
  id: string;
  title: string;
  description?: string;
  estimate?: number;  // Keep as number since backend expects it
}

export interface RoomResponse {
  id: string;
  name: string;
  participants: string[];
  votingActive: boolean;
  currentStory?: Story;
  stories: Story[];
  ownerId: string;
}