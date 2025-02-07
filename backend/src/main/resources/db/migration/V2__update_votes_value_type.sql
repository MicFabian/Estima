-- First, remove the foreign key constraints
ALTER TABLE votes DROP CONSTRAINT fk_room;
ALTER TABLE votes DROP CONSTRAINT fk_story;

-- Create a new temporary column
ALTER TABLE votes ADD COLUMN value_int INTEGER;

-- Update the new column with converted values
UPDATE votes SET value_int = CASE 
    WHEN value = '?' THEN -1 
    ELSE CAST(value AS INTEGER) 
END;

-- Drop the old column
ALTER TABLE votes DROP COLUMN value;

-- Rename the new column
ALTER TABLE votes RENAME COLUMN value_int TO value;

-- Make the column not null
ALTER TABLE votes ALTER COLUMN value SET NOT NULL;

-- Re-add the foreign key constraints
ALTER TABLE votes ADD CONSTRAINT fk_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE;
ALTER TABLE votes ADD CONSTRAINT fk_story FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE;
