-- Add soft delete column to education_students table
ALTER TABLE education_students
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_education_students_deleted_at ON education_students(deleted_at);