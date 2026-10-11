-- Migration 004: Articles multi-language schema
-- Updates the articles table to support multi-language content (DE/FR/AR)
-- and adds status enum, author_id, image_url, published_at fields.
--
-- Target: MariaDB 11.x
-- Idempotent: safe to run more than once.

-- ------------------------------------------------------------
-- Articles table: add multi-language columns
-- ------------------------------------------------------------
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS title_de VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS title_fr VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS content_de TEXT NULL,
  ADD COLUMN IF NOT EXISTS content_fr TEXT NULL,
  ADD COLUMN IF NOT EXISTS content_ar TEXT NULL,
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS status ENUM ('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS author_id BIGINT UNSIGNED NULL,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMP NULL;

-- ------------------------------------------------------------
-- Add foreign key for author_id
-- ------------------------------------------------------------
SET @fk_exists = (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'articles'
    AND COLUMN_NAME = 'author_id'
    AND REFERENCED_TABLE_NAME = 'users'
);

SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE articles ADD CONSTRAINT articles_author_id_fk FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE SET NULL',
  'SELECT "Foreign key already exists" AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------
-- Add indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS articles_status_idx ON articles (status);
CREATE INDEX IF NOT EXISTS articles_author_idx ON articles (author_id);
CREATE INDEX IF NOT EXISTS articles_published_at_idx ON articles (published_at);

-- ------------------------------------------------------------
-- Drop old columns that are no longer used
-- (Commented out for safety - uncomment after verifying data migration)
-- ------------------------------------------------------------
-- ALTER TABLE articles
--   DROP COLUMN IF EXISTS title,
--   DROP COLUMN IF EXISTS content,
--   DROP COLUMN IF EXISTS is_published,
--   DROP COLUMN IF EXISTS published_date,
--   DROP COLUMN IF EXISTS created_by_user_id,
--   DROP COLUMN IF EXISTS updated_by_user_id;

-- ------------------------------------------------------------
-- Data migration (if needed): Copy data from old columns to new ones
-- ------------------------------------------------------------
-- UPDATE articles
-- SET
--   title_de = COALESCE(title, ''),
--   title_fr = COALESCE(title, ''),
--   title_ar = COALESCE(title, ''),
--   content_de = COALESCE(content, ''),
--   content_fr = COALESCE(content, ''),
--   content_ar = COALESCE(content, ''),
--   status = CASE WHEN is_published THEN 'published' ELSE 'draft' END,
--   author_id = COALESCE(created_by_user_id, 1),
--   published_at = published_date
-- WHERE title_de IS NULL OR content_de IS NULL;