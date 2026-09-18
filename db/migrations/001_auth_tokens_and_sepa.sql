-- Migration 001: auth tokens, SEPA fields, student fields
-- Aligns the live database with db/schema.ts for the magic-link auth,
-- membership and education-registration flows.
--
-- Target: MariaDB 11.x
-- Idempotent: safe to run more than once.

-- ------------------------------------------------------------
-- Magic-link / confirmation tokens
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auth_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  token VARCHAR(255) NOT NULL,
  token_type VARCHAR(50) NOT NULL DEFAULT 'magic_link',
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY auth_tokens_token_idx (token),
  KEY auth_tokens_user_idx (user_id),
  KEY auth_tokens_expires_at_idx (expires_at),
  CONSTRAINT auth_tokens_user_id_fk
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- users: SEPA mandate fields + gender enum (male/female only)
-- ------------------------------------------------------------
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS bank_account_holder VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS sepa_mandate_accepted TINYINT(1) NOT NULL DEFAULT 0,
  MODIFY COLUMN gender ENUM ('Männlich', 'Weiblich')
    NOT NULL DEFAULT 'Männlich';

-- ------------------------------------------------------------
-- students: estimated level + gender enum (male/female only)
-- ------------------------------------------------------------
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS estimated_level VARCHAR(50) NULL,
  MODIFY COLUMN gender ENUM ('Männlich', 'Weiblich')
    NOT NULL DEFAULT 'Männlich';
