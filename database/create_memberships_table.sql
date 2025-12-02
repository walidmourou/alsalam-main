-- Create memberships table for AL-SALAM E.V.
CREATE TABLE IF NOT EXISTS memberships (
    id SERIAL PRIMARY KEY,
    membership_id VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')) NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    marital_status VARCHAR(20) CHECK (
        marital_status IN ('single', 'married', 'divorced', 'widowed')
    ) NOT NULL,
    sepa_account_holder VARCHAR(255) NOT NULL,
    sepa_iban VARCHAR(34) NOT NULL,
    sepa_bic VARCHAR(11),
    sepa_bank VARCHAR(255) NOT NULL,
    sepa_mandate_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    confirmation_token VARCHAR(64),
    confirmed_at TIMESTAMP NULL,
    status VARCHAR(20) CHECK (
        status IN (
            'pending',
            'approved',
            'rejected',
            'active',
            'inactive',
            'cancelled'
        )
    ) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_memberships_email ON memberships(email);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_created_at ON memberships(created_at);
CREATE INDEX IF NOT EXISTS idx_memberships_confirmation_token ON memberships(confirmation_token);