-- Create memberships and students tables with proper foreign keys to users
-- Memberships are linked to users with type and status tracking
-- Students are linked to users (guardians) via student_guardians junction table
-- Memberships table
CREATE TABLE IF NOT EXISTS memberships (
    id SERIAL PRIMARY KEY,
    membership_id VARCHAR(50) UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    membership_type_id INTEGER NOT NULL REFERENCES membership_types(id),
    status_id INTEGER NOT NULL REFERENCES membership_statuses(id),
    start_date DATE,
    end_date DATE,
    annual_fee DECIMAL(10, 2),
    notes TEXT,
    sepa_account_holder VARCHAR(255),
    sepa_iban VARCHAR(34),
    sepa_bic VARCHAR(11),
    sepa_bank VARCHAR(255),
    sepa_mandate_accepted BOOLEAN DEFAULT FALSE,
    confirmation_token VARCHAR(64) UNIQUE,
    confirmed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
-- Students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender_id INTEGER REFERENCES genders(id),
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    medical_info TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
-- Student guardians junction table (many-to-many)
CREATE TABLE IF NOT EXISTS student_guardians (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship_type_id INTEGER NOT NULL REFERENCES relationship_types(id),
    is_primary BOOLEAN DEFAULT FALSE,
    can_pickup BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, user_id)
);
-- Auth tokens table for passwordless authentication
CREATE TABLE IF NOT EXISTS auth_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(64) UNIQUE NOT NULL,
    token_type VARCHAR(20) DEFAULT 'magic_link',
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Articles table for news and announcements
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title_de TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    title_fr TEXT NOT NULL,
    content_de TEXT NOT NULL,
    content_ar TEXT NOT NULL,
    content_fr TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id),
    published_at TIMESTAMP NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_by_user_id INTEGER REFERENCES users(id),
    updated_by_user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create indexes for memberships
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_membership_type_id ON memberships(membership_type_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status_id ON memberships(status_id);
CREATE INDEX IF NOT EXISTS idx_memberships_start_date ON memberships(start_date);
CREATE INDEX IF NOT EXISTS idx_memberships_end_date ON memberships(end_date);
CREATE INDEX IF NOT EXISTS idx_memberships_deleted_at ON memberships(deleted_at);
CREATE INDEX IF NOT EXISTS idx_memberships_confirmation_token ON memberships(confirmation_token);
-- Create indexes for students
CREATE INDEX IF NOT EXISTS idx_students_gender_id ON students(gender_id);
CREATE INDEX IF NOT EXISTS idx_students_birth_date ON students(birth_date);
CREATE INDEX IF NOT EXISTS idx_students_deleted_at ON students(deleted_at);
-- Create indexes for student_guardians
CREATE INDEX IF NOT EXISTS idx_student_guardians_student_id ON student_guardians(student_id);
CREATE INDEX IF NOT EXISTS idx_student_guardians_user_id ON student_guardians(user_id);
CREATE INDEX IF NOT EXISTS idx_student_guardians_relationship_type_id ON student_guardians(relationship_type_id);
CREATE INDEX IF NOT EXISTS idx_student_guardians_is_primary ON student_guardians(is_primary);
-- Create indexes for auth_tokens
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);
-- Create indexes for articles
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_is_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_created_by_user_id ON articles(created_by_user_id);
-- Create triggers
CREATE TRIGGER update_memberships_updated_at BEFORE
UPDATE ON memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE
UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE
UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Create view for active memberships
CREATE OR REPLACE VIEW vw_active_memberships AS
SELECT m.id,
    m.membership_id,
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    u.address,
    mt.name as membership_type,
    mt.code as membership_type_code,
    ms.code as status_code,
    m.start_date,
    m.end_date,
    m.annual_fee,
    m.created_at
FROM memberships m
    JOIN users u ON m.user_id = u.id
    JOIN membership_types mt ON m.membership_type_id = mt.id
    JOIN membership_statuses ms ON m.status_id = ms.id
WHERE m.deleted_at IS NULL
    AND u.deleted_at IS NULL;
-- Create view for students with guardians
CREATE OR REPLACE VIEW vw_students_with_guardians AS
SELECT s.id as student_id,
    s.first_name as student_first_name,
    s.last_name as student_last_name,
    s.birth_date,
    g.code as gender_code,
    u.id as guardian_user_id,
    u.email as guardian_email,
    u.first_name as guardian_first_name,
    u.last_name as guardian_last_name,
    u.phone as guardian_phone,
    rt.code as relationship_code,
    sg.is_primary,
    sg.can_pickup
FROM students s
    LEFT JOIN genders g ON s.gender_id = g.id
    LEFT JOIN student_guardians sg ON s.id = sg.student_id
    LEFT JOIN users u ON sg.user_id = u.id
    LEFT JOIN relationship_types rt ON sg.relationship_type_id = rt.id
WHERE s.deleted_at IS NULL;
-- Table comments
COMMENT ON TABLE memberships IS 'Membership records linked to users table with type and status tracking';
COMMENT ON TABLE students IS 'Students in education programs - linked to users (guardians) via student_guardians junction table';
COMMENT ON TABLE student_guardians IS 'Junction table connecting students to their guardians (users) with relationship details';
COMMENT ON TABLE auth_tokens IS 'Magic link tokens for passwordless authentication';
COMMENT ON TABLE articles IS 'News articles and announcements with multilingual content';