-- Create lookup tables for normalized data
-- These tables store enumerated values with multilingual support
-- Gender lookup table
CREATE TABLE IF NOT EXISTS genders (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    label_de VARCHAR(50) NOT NULL,
    label_ar VARCHAR(50) NOT NULL,
    label_fr VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
-- Marital status lookup table
CREATE TABLE IF NOT EXISTS marital_statuses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    label_de VARCHAR(50) NOT NULL,
    label_ar VARCHAR(50) NOT NULL,
    label_fr VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
-- Membership status lookup table
CREATE TABLE IF NOT EXISTS membership_statuses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    label_de VARCHAR(50) NOT NULL,
    label_ar VARCHAR(50) NOT NULL,
    label_fr VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
-- Membership type lookup table
CREATE TABLE IF NOT EXISTS membership_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_annual_fee DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Relationship types for student-guardian relationships
CREATE TABLE IF NOT EXISTS relationship_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    label_de VARCHAR(50) NOT NULL,
    label_ar VARCHAR(50) NOT NULL,
    label_fr VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
-- Payment method lookup table
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Payment status lookup table
CREATE TABLE IF NOT EXISTS payment_statuses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    label_de VARCHAR(50) NOT NULL,
    label_ar VARCHAR(50) NOT NULL,
    label_fr VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
-- Schedule days lookup table
CREATE TABLE IF NOT EXISTS schedule_days (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    day_number INTEGER NOT NULL,
    label_de VARCHAR(50) NOT NULL,
    label_ar VARCHAR(50) NOT NULL,
    label_fr VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
-- Education years lookup table
CREATE TABLE IF NOT EXISTS education_years (
    id SERIAL PRIMARY KEY,
    year_label VARCHAR(20) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Education levels lookup table
CREATE TABLE IF NOT EXISTS education_levels (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    label_de VARCHAR(100) NOT NULL,
    label_ar VARCHAR(100) NOT NULL,
    label_fr VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Enrollment status lookup table
CREATE TABLE IF NOT EXISTS enrollment_statuses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    label_de VARCHAR(50) NOT NULL,
    label_ar VARCHAR(50) NOT NULL,
    label_fr VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
-- Attendance status lookup table
CREATE TABLE IF NOT EXISTS attendance_statuses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    label_de VARCHAR(50) NOT NULL,
    label_ar VARCHAR(50) NOT NULL,
    label_fr VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
-- Insert default values for genders
INSERT INTO genders (code, label_de, label_ar, label_fr)
VALUES ('male', 'Männlich', 'ذكر', 'Masculin'),
    ('female', 'Weiblich', 'أنثى', 'Féminin'),
    ('other', 'Divers', 'آخر', 'Autre') ON CONFLICT (code) DO NOTHING;
-- Insert default values for marital statuses
INSERT INTO marital_statuses (code, label_de, label_ar, label_fr)
VALUES ('single', 'Ledig', 'أعزب', 'Célibataire'),
    ('married', 'Verheiratet', 'متزوج', 'Marié'),
    ('divorced', 'Geschieden', 'مطلق', 'Divorcé'),
    ('widowed', 'Verwitwet', 'أرمل', 'Veuf/Veuve') ON CONFLICT (code) DO NOTHING;
-- Insert default values for membership statuses
INSERT INTO membership_statuses (code, label_de, label_ar, label_fr)
VALUES (
        'pending',
        'Ausstehend',
        'قيد الانتظار',
        'En attente'
    ),
    (
        'approved',
        'Genehmigt',
        'موافق عليه',
        'Approuvé'
    ),
    ('active', 'Aktiv', 'نشط', 'Actif'),
    ('inactive', 'Inaktiv', 'غير نشط', 'Inactif'),
    ('cancelled', 'Storniert', 'ملغى', 'Annulé') ON CONFLICT (code) DO NOTHING;
-- Insert default values for membership types
INSERT INTO membership_types (code, name, description, default_annual_fee)
VALUES (
        'individual',
        'Einzelmitgliedschaft',
        'Individual membership',
        50.00
    ),
    (
        'family',
        'Familienmitgliedschaft',
        'Family membership',
        80.00
    ),
    (
        'student',
        'Studentenmitgliedschaft',
        'Student membership (reduced)',
        30.00
    ),
    (
        'senior',
        'Seniorenmitgliedschaft',
        'Senior membership (reduced)',
        30.00
    ),
    (
        'honorary',
        'Ehrenmitgliedschaft',
        'Honorary membership',
        0.00
    ) ON CONFLICT (code) DO NOTHING;
-- Insert default values for relationship types
INSERT INTO relationship_types (code, label_de, label_ar, label_fr)
VALUES ('mother', 'Mutter', 'أم', 'Mère'),
    ('father', 'Vater', 'أب', 'Père'),
    ('guardian', 'Vormund', 'وصي', 'Tuteur'),
    ('other', 'Sonstiges', 'آخر', 'Autre') ON CONFLICT (code) DO NOTHING;
-- Insert default values for payment methods
INSERT INTO payment_methods (code, name, type)
VALUES ('sepa', 'SEPA-Lastschrift', 'direct_debit'),
    ('bank_transfer', 'Banküberweisung', 'transfer'),
    ('cash', 'Bargeld', 'cash'),
    ('card', 'Karte', 'card') ON CONFLICT (code) DO NOTHING;
-- Insert default values for payment statuses
INSERT INTO payment_statuses (code, label_de, label_ar, label_fr)
VALUES (
        'pending',
        'Ausstehend',
        'قيد الانتظار',
        'En attente'
    ),
    ('completed', 'Abgeschlossen', 'مكتمل', 'Terminé'),
    ('failed', 'Fehlgeschlagen', 'فشل', 'Échoué'),
    ('refunded', 'Erstattet', 'مسترد', 'Remboursé') ON CONFLICT (code) DO NOTHING;
-- Insert default values for schedule days
INSERT INTO schedule_days (code, day_number, label_de, label_ar, label_fr)
VALUES ('monday', 1, 'Montag', 'الاثنين', 'Lundi'),
    ('tuesday', 2, 'Dienstag', 'الثلاثاء', 'Mardi'),
    (
        'wednesday',
        3,
        'Mittwoch',
        'الأربعاء',
        'Mercredi'
    ),
    ('thursday', 4, 'Donnerstag', 'الخميس', 'Jeudi'),
    ('friday', 5, 'Freitag', 'الجمعة', 'Vendredi'),
    ('saturday', 6, 'Samstag', 'السبت', 'Samedi'),
    ('sunday', 7, 'Sonntag', 'الأحد', 'Dimanche') ON CONFLICT (code) DO NOTHING;
-- Insert default values for education levels
INSERT INTO education_levels (
        code,
        label_de,
        label_ar,
        label_fr,
        description,
        sort_order
    )
VALUES (
        'preparatory',
        'Vorbereitungsstufe',
        'المستوى التحضيري',
        'Niveau préparatoire',
        'Preparation level for young children',
        1
    ),
    (
        'level1',
        'Stufe 1',
        'المستوى 1',
        'Niveau 1',
        'Beginner level',
        2
    ),
    (
        'level2',
        'Stufe 2',
        'المستوى 2',
        'Niveau 2',
        'Elementary level',
        3
    ),
    (
        'level3',
        'Stufe 3',
        'المستوى 3',
        'Niveau 3',
        'Intermediate level',
        4
    ),
    (
        'level4',
        'Stufe 4',
        'المستوى 4',
        'Niveau 4',
        'Advanced level',
        5
    ) ON CONFLICT (code) DO NOTHING;
-- Insert default values for enrollment statuses
INSERT INTO enrollment_statuses (code, label_de, label_ar, label_fr)
VALUES ('enrolled', 'Eingeschrieben', 'مسجل', 'Inscrit'),
    (
        'waitlist',
        'Warteliste',
        'قائمة الانتظار',
        'Liste d''attente'
    ),
    ('withdrawn', 'Zurückgezogen', 'منسحب', 'Retiré'),
    ('completed', 'Abgeschlossen', 'مكتمل', 'Terminé') ON CONFLICT (code) DO NOTHING;
-- Insert default values for attendance statuses
INSERT INTO attendance_statuses (code, label_de, label_ar, label_fr)
VALUES ('present', 'Anwesend', 'حاضر', 'Présent'),
    ('absent', 'Abwesend', 'غائب', 'Absent'),
    ('excused', 'Entschuldigt', 'معذور', 'Excusé'),
    ('late', 'Verspätet', 'متأخر', 'En retard') ON CONFLICT (code) DO NOTHING;
-- Create indexes for lookup tables
CREATE INDEX IF NOT EXISTS idx_genders_code ON genders(code);
CREATE INDEX IF NOT EXISTS idx_marital_statuses_code ON marital_statuses(code);
CREATE INDEX IF NOT EXISTS idx_membership_statuses_code ON membership_statuses(code);
CREATE INDEX IF NOT EXISTS idx_membership_types_code ON membership_types(code);
CREATE INDEX IF NOT EXISTS idx_relationship_types_code ON relationship_types(code);
CREATE INDEX IF NOT EXISTS idx_payment_methods_code ON payment_methods(code);
CREATE INDEX IF NOT EXISTS idx_payment_statuses_code ON payment_statuses(code);
CREATE INDEX IF NOT EXISTS idx_schedule_days_code ON schedule_days(code);
CREATE INDEX IF NOT EXISTS idx_education_levels_code ON education_levels(code);
CREATE INDEX IF NOT EXISTS idx_enrollment_statuses_code ON enrollment_statuses(code);
CREATE INDEX IF NOT EXISTS idx_attendance_statuses_code ON attendance_statuses(code);