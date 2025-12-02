-- Add soft delete column to education_requesters table
ALTER TABLE education_requesters
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_education_requesters_deleted_at ON education_requesters(deleted_at);