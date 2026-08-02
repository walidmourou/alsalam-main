-- Financial tracking system
-- Incoming money, purchases, and payment tracking
-- Incoming types lookup
CREATE TABLE IF NOT EXISTS incoming_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    label_de VARCHAR(100) NOT NULL,
    label_ar VARCHAR(100) NOT NULL,
    label_fr VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
-- Purchase categories lookup
CREATE TABLE IF NOT EXISTS purchase_categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    label_de VARCHAR(100) NOT NULL,
    label_ar VARCHAR(100) NOT NULL,
    label_fr VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
-- Incoming money (revenue)
CREATE TABLE IF NOT EXISTS incoming (
    id SERIAL PRIMARY KEY,
    incoming_type_id INTEGER NOT NULL REFERENCES incoming_types(id),
    payment_method_id INTEGER NOT NULL REFERENCES payment_methods(id),
    user_id INTEGER REFERENCES users(id),
    membership_id INTEGER REFERENCES memberships(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    description TEXT,
    transaction_reference VARCHAR(100),
    receipt_number VARCHAR(50),
    received_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Purchases (expenses)
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    purchase_category_id INTEGER NOT NULL REFERENCES purchase_categories(id),
    payment_method_id INTEGER NOT NULL REFERENCES payment_methods(id),
    purchased_by_user_id INTEGER REFERENCES users(id),
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    invoice_number VARCHAR(50),
    invoice_date DATE,
    vendor_name VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Payments (general transactions - can be linked to memberships, education, etc.)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    membership_id INTEGER REFERENCES memberships(id),
    payment_method_id INTEGER NOT NULL REFERENCES payment_methods(id),
    payment_status_id INTEGER NOT NULL REFERENCES payment_statuses(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    description TEXT,
    transaction_reference VARCHAR(100),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Insert default incoming types
INSERT INTO incoming_types (code, label_de, label_ar, label_fr)
VALUES ('donation', 'Spende', 'تبرع', 'Don'),
    (
        'membership_fee',
        'Mitgliedsbeitrag',
        'رسوم العضوية',
        'Cotisation'
    ),
    (
        'education_fee',
        'Bildungsgebühr',
        'رسوم التعليم',
        'Frais de scolarité'
    ),
    (
        'event_revenue',
        'Veranstaltungseinnahme',
        'إيرادات الفعالية',
        'Revenus d''événement'
    ),
    ('other', 'Sonstiges', 'آخر', 'Autre') ON CONFLICT (code) DO NOTHING;
-- Insert default purchase categories
INSERT INTO purchase_categories (code, label_de, label_ar, label_fr)
VALUES (
        'supplies',
        'Verbrauchsmaterial',
        'اللوازم',
        'Fournitures'
    ),
    (
        'utilities',
        'Nebenkosten',
        'المرافق',
        'Services publics'
    ),
    (
        'maintenance',
        'Instandhaltung',
        'الصيانة',
        'Entretien'
    ),
    (
        'equipment',
        'Ausrüstung',
        'المعدات',
        'Équipement'
    ),
    ('food', 'Lebensmittel', 'طعام', 'Nourriture'),
    ('books', 'Bücher', 'كتب', 'Livres'),
    ('rent', 'Miete', 'إيجار', 'Loyer'),
    (
        'insurance',
        'Versicherung',
        'تأمين',
        'Assurance'
    ),
    ('marketing', 'Marketing', 'تسويق', 'Marketing'),
    ('other', 'Sonstiges', 'آخر', 'Autre') ON CONFLICT (code) DO NOTHING;
-- Create indexes for incoming
CREATE INDEX IF NOT EXISTS idx_incoming_type_id ON incoming(incoming_type_id);
CREATE INDEX IF NOT EXISTS idx_incoming_payment_method_id ON incoming(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_incoming_user_id ON incoming(user_id);
CREATE INDEX IF NOT EXISTS idx_incoming_membership_id ON incoming(membership_id);
CREATE INDEX IF NOT EXISTS idx_incoming_received_date ON incoming(received_date);
CREATE INDEX IF NOT EXISTS idx_incoming_amount ON incoming(amount);
-- Create indexes for purchases
CREATE INDEX IF NOT EXISTS idx_purchases_category_id ON purchases(purchase_category_id);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_method_id ON purchases(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_purchases_purchased_by_user_id ON purchases(purchased_by_user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_invoice_date ON purchases(invoice_date);
CREATE INDEX IF NOT EXISTS idx_purchases_amount ON purchases(amount);
-- Create indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_membership_id ON payments(membership_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method_id ON payments(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_status_id ON payments(payment_status_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_amount ON payments(amount);
-- Create triggers
CREATE TRIGGER update_incoming_updated_at BEFORE
UPDATE ON incoming FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE
UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE
UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Create financial views
-- View for incoming summary by type
CREATE OR REPLACE VIEW vw_incoming_summary AS
SELECT it.code as income_type,
    it.label_de,
    DATE_TRUNC('month', i.received_date) as month,
    COUNT(*) as transaction_count,
    SUM(i.amount) as total_amount,
    i.currency
FROM incoming i
    JOIN incoming_types it ON i.incoming_type_id = it.id
GROUP BY it.code,
    it.label_de,
    DATE_TRUNC('month', i.received_date),
    i.currency
ORDER BY month DESC,
    total_amount DESC;
-- View for purchase summary by category
CREATE OR REPLACE VIEW vw_purchase_summary AS
SELECT pc.code as category_code,
    pc.label_de,
    DATE_TRUNC('month', p.invoice_date) as month,
    COUNT(*) as purchase_count,
    SUM(p.amount) as total_amount,
    p.currency
FROM purchases p
    JOIN purchase_categories pc ON p.purchase_category_id = pc.id
WHERE p.invoice_date IS NOT NULL
GROUP BY pc.code,
    pc.label_de,
    DATE_TRUNC('month', p.invoice_date),
    p.currency
ORDER BY month DESC,
    total_amount DESC;
-- View for monthly financial overview
CREATE OR REPLACE VIEW vw_monthly_financial_overview AS WITH monthly_income AS (
        SELECT DATE_TRUNC('month', received_date) as month,
            SUM(amount) as total_income
        FROM incoming
        WHERE currency = 'EUR'
        GROUP BY DATE_TRUNC('month', received_date)
    ),
    monthly_expenses AS (
        SELECT DATE_TRUNC('month', invoice_date) as month,
            SUM(amount) as total_expenses
        FROM purchases
        WHERE currency = 'EUR'
            AND invoice_date IS NOT NULL
        GROUP BY DATE_TRUNC('month', invoice_date)
    )
SELECT COALESCE(mi.month, me.month) as month,
    COALESCE(mi.total_income, 0) as income,
    COALESCE(me.total_expenses, 0) as expenses,
    COALESCE(mi.total_income, 0) - COALESCE(me.total_expenses, 0) as net_balance
FROM monthly_income mi
    FULL OUTER JOIN monthly_expenses me ON mi.month = me.month
ORDER BY month DESC;
-- View for membership payments
CREATE OR REPLACE VIEW vw_membership_payments AS
SELECT p.id,
    p.payment_date,
    p.amount,
    p.currency,
    p.description,
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.email,
    m.membership_id,
    mt.name as membership_type,
    pm.name as payment_method,
    ps.code as payment_status
FROM payments p
    JOIN users u ON p.user_id = u.id
    JOIN memberships m ON p.membership_id = m.id
    JOIN membership_types mt ON m.membership_type_id = mt.id
    JOIN payment_methods pm ON p.payment_method_id = pm.id
    JOIN payment_statuses ps ON p.payment_status_id = ps.id
ORDER BY p.payment_date DESC;
-- Comments
COMMENT ON TABLE incoming IS 'Revenue tracking - donations, membership fees, education fees, etc.';
COMMENT ON TABLE purchases IS 'Expense tracking - organizational purchases and costs';
COMMENT ON TABLE payments IS 'Payment transactions - linked to users and memberships';