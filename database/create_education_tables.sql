-- Education Registration Tables - Updated Schema
-- Main education requester table
CREATE TABLE IF NOT EXISTS education_requesters (
    id SERIAL PRIMARY KEY,
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
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
    confirmation_token VARCHAR(64) UNIQUE,
    confirmed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_education_requesters_email ON education_requesters(email);
CREATE INDEX IF NOT EXISTS idx_education_requesters_status ON education_requesters(status);
CREATE INDEX IF NOT EXISTS idx_education_requesters_confirmation_token ON education_requesters(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_education_requesters_created_at ON education_requesters(created_at);
-- Education students table
CREATE TABLE IF NOT EXISTS education_students (
    id SERIAL PRIMARY KEY,
    requester_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    estimated_level VARCHAR(20) CHECK (
        estimated_level IN (
            'preparatory',
            'level1',
            'level2',
            'level3',
            'level4'
        )
    ) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES education_requesters(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_education_students_requester_id ON education_students(requester_id);
CREATE INDEX IF NOT EXISTS idx_education_students_birth_date ON education_students(birth_date);