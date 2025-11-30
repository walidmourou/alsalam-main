-- Create memberships table for AL-SALAM E.V.
CREATE TABLE IF NOT EXISTS memberships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    membership_id VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    marital_status ENUM('single', 'married', 'divorced', 'widowed') NOT NULL,
    sepa_account_holder VARCHAR(255) NOT NULL,
    sepa_iban VARCHAR(34) NOT NULL,
    sepa_bic VARCHAR(11),
    sepa_bank VARCHAR(255) NOT NULL,
    sepa_mandate_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    confirmation_token VARCHAR(64),
    confirmed_at TIMESTAMP NULL,
    status ENUM(
        'pending',
        'approved',
        'rejected',
        'active',
        'inactive'
    ) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_confirmation_token (confirmation_token)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;