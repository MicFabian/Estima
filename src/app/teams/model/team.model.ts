import { User } from '../../auth/model/user.model';

export interface Team {
  id: string;
  name: string;
  description?: string;
  owner: User;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface TeamMemberRequest {
  userId: string;
}
