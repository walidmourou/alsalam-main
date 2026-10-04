-- Migration 003: school rules acceptance per guardian relation
-- The acceptance of the school rules is a boolean on the relation between a
-- guardian and a child, so it moves out of the free text `students.notes`
-- block written by an earlier version.
--
-- Target: MariaDB 11.x
-- Idempotent: safe to run more than once.

ALTER TABLE student_guardians
  ADD COLUMN IF NOT EXISTS school_rules_accepted TINYINT(1) NOT NULL DEFAULT 0
    COMMENT 'Die Schulordnung wurde für diese Beziehung akzeptiert';

-- ------------------------------------------------------------
-- Carry the acceptance over from the legacy notes block first, then
-- drop the block: only parent supplied text is left in `notes`.
-- ------------------------------------------------------------
UPDATE student_guardians sg
JOIN students s ON s.id = sg.student_id
SET sg.school_rules_accepted = 1
WHERE s.notes LIKE '%Schulordnung: akzeptiert%';

UPDATE students
SET notes = NULLIF(TRIM(SUBSTRING_INDEX(notes, '[Einverständnis]', 1)), '')
WHERE notes LIKE '%[Einverständnis]%';