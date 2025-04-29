-- Add team_id column to rooms table
ALTER TABLE rooms
ADD COLUMN team_id UUID;

-- Add foreign key constraint connecting rooms to teams
ALTER TABLE rooms
ADD CONSTRAINT fk_rooms_team
FOREIGN KEY (team_id) REFERENCES teams(id)
ON DELETE SET NULL;
