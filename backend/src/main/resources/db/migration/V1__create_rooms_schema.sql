CREATE TABLE rooms (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id VARCHAR(255) NOT NULL,
    voting_active BOOLEAN NOT NULL DEFAULT FALSE,
    current_story_id UUID
);

CREATE TABLE stories (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    estimate INTEGER,
    room_id UUID NOT NULL
);

CREATE TABLE room_participants (
    room_id UUID NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (room_id, user_id)
);

CREATE TABLE votes (
    id UUID PRIMARY KEY,
    room_id UUID NOT NULL,
    story_id UUID,
    user_id VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL
);

ALTER TABLE stories ADD CONSTRAINT fk_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE;
ALTER TABLE room_participants ADD CONSTRAINT fk_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE;
ALTER TABLE votes ADD CONSTRAINT fk_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE;
ALTER TABLE votes ADD CONSTRAINT fk_story FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE;
ALTER TABLE rooms ADD CONSTRAINT fk_story FOREIGN KEY (current_story_id) REFERENCES stories(id);
