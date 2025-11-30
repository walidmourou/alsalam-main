-- Add soft delete column to memberships table
ALTER TABLE memberships
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
-- Add index for deleted_at column
ALTER TABLE memberships
ADD INDEX idx_deleted_at (deleted_at);
-- Update status enum to include 'cancelled'
ALTER TABLE memberships
MODIFY COLUMN status ENUM(
        'pending',
        'approved',
        'rejected',
        'active',
        'inactive',
        'cancelled'
    ) NOT NULL DEFAULT 'pending';