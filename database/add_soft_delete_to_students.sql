-- Add soft delete column to education_students table
ALTER TABLE education_students
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL,
    ADD INDEX idx_deleted_at (deleted_at);