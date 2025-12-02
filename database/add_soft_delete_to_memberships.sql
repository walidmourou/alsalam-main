-- Add soft delete column to memberships table
ALTER TABLE memberships
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
-- Add index for deleted_at column
CREATE INDEX IF NOT EXISTS idx_memberships_deleted_at ON memberships(deleted_at);
-- Update status to include 'cancelled' (already in CHECK constraint)