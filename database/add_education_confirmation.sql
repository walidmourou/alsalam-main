-- Add confirmation_token and confirmed_at to education_requesters table
ALTER TABLE education_requesters
ADD COLUMN confirmation_token VARCHAR(64) UNIQUE
AFTER status,
    ADD COLUMN confirmed_at TIMESTAMP NULL
AFTER confirmation_token,
    ADD INDEX idx_confirmation_token (confirmation_token);