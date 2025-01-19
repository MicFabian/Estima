export interface CreateVoteRequest {
  userId: string;
  value: string;
  roomId: string;
}

export interface VoteResponse {
  userId: string;
  value: string;
  roomId: string;
}

export interface CreateRoomRequest {
  name: string;
}

export interface RoomResponse {
  id: string;
  name: string;
  participants: string[];
  votingActive: boolean;
} 