-- Education Registration Tables - Updated Schema
-- Main education requester table
CREATE TABLE IF NOT EXISTS education_requesters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    education_id VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    -- Additional responsible person fields
    responsible_first_name VARCHAR(100),
    responsible_last_name VARCHAR(100),
    responsible_address TEXT,
    responsible_email VARCHAR(255),
    responsible_phone VARCHAR(50),
    consent_media_online BOOLEAN NOT NULL DEFAULT FALSE,
    consent_media_print BOOLEAN NOT NULL DEFAULT FALSE,
    consent_media_promotion BOOLEAN NOT NULL DEFAULT FALSE,
    school_rules_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    sepa_account_holder VARCHAR(255) NOT NULL,
    sepa_iban VARCHAR(34) NOT NULL,
    sepa_bic VARCHAR(11),
    sepa_bank VARCHAR(255) NOT NULL,
    sepa_mandate BOOLEAN NOT NULL DEFAULT FALSE,
    lang VARCHAR(2) NOT NULL DEFAULT 'de',
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    confirmation_token VARCHAR(64) UNIQUE,
    confirmed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_confirmation_token (confirmation_token),
    INDEX idx_created_at (created_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Education students table
CREATE TABLE IF NOT EXISTS education_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requester_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    estimated_level ENUM(
        'preparatory',
        'level1',
        'level2',
        'level3',
        'level4'
    ) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES education_requesters(id) ON DELETE CASCADE,
    INDEX idx_requester_id (requester_id),
    INDEX idx_birth_date (birth_date)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;