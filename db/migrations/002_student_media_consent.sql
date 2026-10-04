-- Migration 002: per student media consent
-- The photo/video permissions are declared per child, so they move out of the
-- free text `students.notes` block into three boolean columns.
--
-- Target: MariaDB 11.x
-- Idempotent: safe to run more than once.

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS media_online TINYINT(1) NOT NULL DEFAULT 0
    COMMENT 'Foto- und Video-Veröffentlichung auf Website und Social Media',
  ADD COLUMN IF NOT EXISTS media_print TINYINT(1) NOT NULL DEFAULT 0
    COMMENT 'Verwendung in Printmedien (Flyer, Broschüre)',
  ADD COLUMN IF NOT EXISTS media_promotion TINYINT(1) NOT NULL DEFAULT 0
    COMMENT 'Verwendung für Pressearbeit und Veranstaltungen';
-- ------------------------------------------------------------
-- Move the permissions that were stored in `students.notes` into
-- the new columns and drop the outdated block. Only rows that still
-- carry the marker are touched, so re-running changes nothing.
-- ------------------------------------------------------------
UPDATE students
SET media_online = IF(notes LIKE '%online=ja%', 1, 0),
    media_print = IF(notes LIKE '%Print=ja%', 1, 0),
    media_promotion = IF(notes LIKE '%Promotion=ja%', 1, 0),
    notes = NULLIF(TRIM(SUBSTRING_INDEX(notes, '[Einverständnis]', 1)), '')
WHERE notes LIKE '%[Einverständnis]%';
