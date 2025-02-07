export interface Room {
  id: string;
  name: string;
  ownerId: string;
  stories: Story[];
  currentStoryId: string | null;
  currentStory: Story | null;
  participants: string[];
}

export interface Story {
  id: string;
  title: string;
  description: string | null;
  estimate: number | null;
  votingActive: boolean;
}
