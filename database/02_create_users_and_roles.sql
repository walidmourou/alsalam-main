-- Create comprehensive users table as central authentication entity
-- This replaces the fragmented membership/education_requester structure
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    gender_id INTEGER REFERENCES genders(id),
    phone VARCHAR(20),
    address TEXT,
    marital_status_id INTEGER REFERENCES marital_statuses(id),
    is_active BOOLEAN DEFAULT TRUE,
    last_connection_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
-- User roles table for role-based access control (RBAC)
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_code VARCHAR(50) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by_user_id INTEGER REFERENCES users(id),
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);
-- Role definitions lookup table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name_de VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Permissions table for fine-grained access control
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
-- Role permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_code VARCHAR(50) REFERENCES roles(code) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_code, permission_id)
);
-- Insert default roles
INSERT INTO roles (
        code,
        name_de,
        name_ar,
        name_fr,
        description,
        is_system_role
    )
VALUES (
        'admin',
        'Administrator',
        'مدير',
        'Administrateur',
        'Full system access',
        TRUE
    ),
    (
        'board_member',
        'Vorstandsmitglied',
        'عضو مجلس الإدارة',
        'Membre du conseil',
        'Board member with management access',
        TRUE
    ),
    (
        'treasurer',
        'Schatzmeister',
        'أمين الصندوق',
        'Trésorier',
        'Financial management access',
        TRUE
    ),
    (
        'teacher',
        'Lehrer',
        'معلم',
        'Enseignant',
        'Education program teacher',
        TRUE
    ),
    (
        'member',
        'Mitglied',
        'عضو',
        'Membre',
        'Regular organization member',
        TRUE
    ),
    (
        'parent',
        'Elternteil',
        'ولي أمر',
        'Parent',
        'Parent/guardian of students',
        TRUE
    ),
    (
        'student',
        'Schüler',
        'طالب',
        'Étudiant',
        'Student in education program',
        TRUE
    ) ON CONFLICT (code) DO NOTHING;
-- Insert default permissions
INSERT INTO permissions (code, name, description, resource, action)
VALUES -- User management
    (
        'users.view',
        'View Users',
        'View user information',
        'users',
        'read'
    ),
    (
        'users.create',
        'Create Users',
        'Create new users',
        'users',
        'create'
    ),
    (
        'users.edit',
        'Edit Users',
        'Edit user information',
        'users',
        'update'
    ),
    (
        'users.delete',
        'Delete Users',
        'Delete users',
        'users',
        'delete'
    ),
    -- Membership management
    (
        'memberships.view',
        'View Memberships',
        'View membership information',
        'memberships',
        'read'
    ),
    (
        'memberships.create',
        'Create Memberships',
        'Create new memberships',
        'memberships',
        'create'
    ),
    (
        'memberships.edit',
        'Edit Memberships',
        'Edit membership information',
        'memberships',
        'update'
    ),
    (
        'memberships.approve',
        'Approve Memberships',
        'Approve membership applications',
        'memberships',
        'approve'
    ),
    (
        'memberships.cancel',
        'Cancel Memberships',
        'Cancel memberships',
        'memberships',
        'cancel'
    ),
    -- Education management
    (
        'education.view',
        'View Education',
        'View education programs and students',
        'education',
        'read'
    ),
    (
        'education.manage',
        'Manage Education',
        'Manage education programs',
        'education',
        'manage'
    ),
    (
        'education.register',
        'Register Students',
        'Register students for programs',
        'education',
        'register'
    ),
    (
        'education.attendance',
        'Manage Attendance',
        'Take and manage attendance',
        'education',
        'attendance'
    ),
    -- Financial management
    (
        'finance.view',
        'View Finance',
        'View financial records',
        'finance',
        'read'
    ),
    (
        'finance.manage',
        'Manage Finance',
        'Full financial management',
        'finance',
        'manage'
    ),
    (
        'finance.payments',
        'Process Payments',
        'Process payment transactions',
        'finance',
        'payments'
    ),
    (
        'finance.reports',
        'Financial Reports',
        'Generate financial reports',
        'finance',
        'reports'
    ),
    -- Content management
    (
        'articles.view',
        'View Articles',
        'View articles and news',
        'articles',
        'read'
    ),
    (
        'articles.create',
        'Create Articles',
        'Create new articles',
        'articles',
        'create'
    ),
    (
        'articles.edit',
        'Edit Articles',
        'Edit articles',
        'articles',
        'update'
    ),
    (
        'articles.publish',
        'Publish Articles',
        'Publish or unpublish articles',
        'articles',
        'publish'
    ),
    (
        'articles.delete',
        'Delete Articles',
        'Delete articles',
        'articles',
        'delete'
    ) ON CONFLICT (code) DO NOTHING;
-- Assign permissions to roles
-- Admin gets all permissions
INSERT INTO role_permissions (role_code, permission_id)
SELECT 'admin',
    id
FROM permissions ON CONFLICT DO NOTHING;
-- Board member permissions
INSERT INTO role_permissions (role_code, permission_id)
SELECT 'board_member',
    id
FROM permissions
WHERE code IN (
        'users.view',
        'users.edit',
        'memberships.view',
        'memberships.create',
        'memberships.edit',
        'memberships.approve',
        'memberships.cancel',
        'education.view',
        'education.manage',
        'education.register',
        'finance.view',
        'finance.reports',
        'articles.view',
        'articles.create',
        'articles.edit',
        'articles.publish'
    ) ON CONFLICT DO NOTHING;
-- Treasurer permissions
INSERT INTO role_permissions (role_code, permission_id)
SELECT 'treasurer',
    id
FROM permissions
WHERE code IN (
        'memberships.view',
        'finance.view',
        'finance.manage',
        'finance.payments',
        'finance.reports'
    ) ON CONFLICT DO NOTHING;
-- Teacher permissions
INSERT INTO role_permissions (role_code, permission_id)
SELECT 'teacher',
    id
FROM permissions
WHERE code IN (
        'education.view',
        'education.attendance',
        'articles.view'
    ) ON CONFLICT DO NOTHING;
-- Member permissions
INSERT INTO role_permissions (role_code, permission_id)
SELECT 'member',
    id
FROM permissions
WHERE code IN ('articles.view') ON CONFLICT DO NOTHING;
-- Parent permissions
INSERT INTO role_permissions (role_code, permission_id)
SELECT 'parent',
    id
FROM permissions
WHERE code IN (
        'education.view',
        'education.register',
        'articles.view'
    ) ON CONFLICT DO NOTHING;
-- Student permissions
INSERT INTO role_permissions (role_code, permission_id)
SELECT 'student',
    id
FROM permissions
WHERE code IN ('articles.view') ON CONFLICT DO NOTHING;
-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_gender_id ON users(gender_id);
CREATE INDEX IF NOT EXISTS idx_users_marital_status_id ON users(marital_status_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_code ON user_roles(role_code);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(code);
CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);
-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Create view for user with roles
CREATE OR REPLACE VIEW vw_user_roles AS
SELECT u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.is_active,
    ARRAY_AGG(DISTINCT ur.role_code) FILTER (
        WHERE ur.role_code IS NOT NULL
    ) as roles,
    ARRAY_AGG(DISTINCT p.code) FILTER (
        WHERE p.code IS NOT NULL
    ) as permissions
FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    AND ur.is_active = TRUE
    LEFT JOIN role_permissions rp ON ur.role_code = rp.role_code
    LEFT JOIN permissions p ON rp.permission_id = p.id
    AND p.is_active = TRUE
WHERE u.deleted_at IS NULL
GROUP BY u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.is_active;