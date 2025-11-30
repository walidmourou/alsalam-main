-- Add soft delete column to education_requesters table
ALTER TABLE education_requesters
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL,
    ADD INDEX idx_deleted_at (deleted_at);