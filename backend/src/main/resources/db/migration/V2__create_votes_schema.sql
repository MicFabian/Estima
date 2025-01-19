CREATE TABLE votes (
    id UUID PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    participant VARCHAR(255) NOT NULL,
    value INTEGER NOT NULL,
    CONSTRAINT unique_vote_per_participant UNIQUE (room_id, participant)
);
