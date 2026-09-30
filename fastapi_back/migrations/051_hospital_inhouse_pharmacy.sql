-- ============================================================
-- Migration 051: Native In-House Hospital Pharmacy System
-- ============================================================

-- 1. Ensure partner_id is nullable on pharmacies
ALTER TABLE pharmacies ALTER COLUMN partner_id DROP NOT NULL;

-- 2. Pharmacy Staff (Pharmacists tied to hospital)
CREATE TABLE IF NOT EXISTS pharmacy_staff (
    id            BIGSERIAL PRIMARY KEY,
    hospital_id   INTEGER NOT NULL REFERENCES hospital_tieups(id) ON DELETE CASCADE,
    pharmacy_id   BIGINT REFERENCES pharmacies(id) ON DELETE SET NULL,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    phone         VARCHAR(32),
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(32) NOT NULL DEFAULT 'pharmacist',
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pharmacy_staff_hospital ON pharmacy_staff(hospital_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_staff_email ON pharmacy_staff(email);

-- 3. Hospital In-House Medicines Inventory
CREATE TABLE IF NOT EXISTS pharmacy_medicines (
    id            BIGSERIAL PRIMARY KEY,
    hospital_id   INTEGER NOT NULL REFERENCES hospital_tieups(id) ON DELETE CASCADE,
    pharmacy_id   BIGINT REFERENCES pharmacies(id) ON DELETE SET NULL,
    name          VARCHAR(255) NOT NULL,
    brand         VARCHAR(255),
    salt          VARCHAR(255),
    category      VARCHAR(120) NOT NULL DEFAULT 'General',
    dosage_form   VARCHAR(64) NOT NULL DEFAULT 'Tablet',
    strength      VARCHAR(64),
    mrp           NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    price         NUMERIC(10, 2) NOT NULL DEFAULT 40.00,
    stock         INTEGER NOT NULL DEFAULT 100,
    requires_rx   BOOLEAN NOT NULL DEFAULT true,
    rack_location VARCHAR(64) DEFAULT 'Rack A-1',
    image         TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pharmacy_medicines_hospital ON pharmacy_medicines(hospital_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_medicines_search ON pharmacy_medicines(name, salt, brand);

-- 4. In-House Hospital Pharmacy Counter Orders (Option 1)
CREATE TABLE IF NOT EXISTS pharmacy_counter_orders (
    id               BIGSERIAL PRIMARY KEY,
    public_id        VARCHAR(64) NOT NULL UNIQUE,
    consultation_id  INTEGER REFERENCES consultations(id) ON DELETE SET NULL,
    appointment_id   INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    hospital_id      INTEGER NOT NULL REFERENCES hospital_tieups(id) ON DELETE CASCADE,
    pharmacy_id      BIGINT REFERENCES pharmacies(id) ON DELETE SET NULL,
    patient_id       BIGINT,
    patient_name     VARCHAR(255) NOT NULL,
    patient_phone    VARCHAR(32),
    doctor_name      VARCHAR(255),
    doctor_specialty VARCHAR(255),
    status           VARCHAR(32) NOT NULL DEFAULT 'received', -- 'received', 'packing', 'ready', 'dispensed', 'cancelled'
    payment_status   VARCHAR(32) NOT NULL DEFAULT 'pending',  -- 'pending', 'paid'
    payment_method   VARCHAR(32) NOT NULL DEFAULT 'cash',     -- 'counter_upi', 'cash'
    amount_subtotal  NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    amount_discount  NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    amount_total     NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    dispensed_at     TIMESTAMPTZ,
    dispensed_by     BIGINT REFERENCES pharmacy_staff(id) ON DELETE SET NULL,
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_counter_orders_hospital_status ON pharmacy_counter_orders(hospital_id, status);
CREATE INDEX IF NOT EXISTS idx_counter_orders_consultation ON pharmacy_counter_orders(consultation_id);
CREATE INDEX IF NOT EXISTS idx_counter_orders_public_id ON pharmacy_counter_orders(public_id);
CREATE INDEX IF NOT EXISTS idx_counter_orders_patient ON pharmacy_counter_orders(patient_id);

-- 5. Pharmacy Counter Order Line Items
CREATE TABLE IF NOT EXISTS pharmacy_counter_order_items (
    id           BIGSERIAL PRIMARY KEY,
    order_id     BIGINT NOT NULL REFERENCES pharmacy_counter_orders(id) ON DELETE CASCADE,
    medicine_id  BIGINT REFERENCES pharmacy_medicines(id) ON DELETE SET NULL,
    name         VARCHAR(255) NOT NULL,
    dosage       VARCHAR(128),
    frequency    VARCHAR(128),
    duration     VARCHAR(128),
    quantity     INTEGER NOT NULL DEFAULT 1,
    unit_price   NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    line_total   NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    instructions TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_counter_order_items_order ON pharmacy_counter_order_items(order_id);

-- 6. Pre-seed default in-house pharmacy for each active hospital
INSERT INTO pharmacies (hospital_id, name, pharmacy_type, supports_pickup, supports_delivery, is_active, manager_name, phone, address)
SELECT 
    h.id,
    h.name || ' In-House Pharmacy',
    'main',
    true,
    false,
    true,
    'Head Pharmacist',
    '9876543210',
    'Ground Floor, ' || COALESCE(h.address, h.name)
FROM hospital_tieups h
WHERE NOT EXISTS (
    SELECT 1 FROM pharmacies p WHERE p.hospital_id = h.id
);

-- 7. Pre-seed essential standard medicines for each hospital
INSERT INTO pharmacy_medicines (hospital_id, name, brand, salt, category, dosage_form, strength, mrp, price, stock, requires_rx, rack_location)
SELECT 
    h.id, m.name, m.brand, m.salt, m.category, m.dosage_form, m.strength, m.mrp, m.price, m.stock, m.requires_rx, m.rack_location
FROM hospital_tieups h
CROSS JOIN (
    VALUES 
        ('Dolo 650', 'Micro Labs', 'Paracetamol', 'Fever & Pain', 'Tablet', '650mg', 33.60, 30.00, 250, false, 'Rack A-01'),
        ('Augmentin 625 Duo', 'GSK', 'Amoxicillin + Clavulanic Acid', 'Antibiotics', 'Tablet', '625mg', 204.00, 180.00, 120, true, 'Rack B-03'),
        ('Azithral 500', 'Alembic', 'Azithromycin', 'Antibiotics', 'Tablet', '500mg', 132.00, 115.00, 100, true, 'Rack B-05'),
        ('Pan 40', 'Alkem', 'Pantoprazole', 'Stomach Care', 'Tablet', '40mg', 98.00, 85.00, 300, false, 'Rack C-02'),
        ('Glycomet 500 SR', 'USV', 'Metformin Hydrochloride', 'Diabetes', 'Tablet', '500mg', 48.00, 42.00, 400, true, 'Rack D-01'),
        ('Telma 40', 'Glenmark', 'Telmisartan', 'Blood Pressure', 'Tablet', '40mg', 85.00, 75.00, 200, true, 'Rack D-04'),
        ('Allegra 120', 'Sanofi', 'Fexofenadine', 'Allergy & Cold', 'Tablet', '120mg', 125.00, 110.00, 150, false, 'Rack E-02'),
        ('Combiflam', 'Sanofi', 'Ibuprofen + Paracetamol', 'Fever & Pain', 'Tablet', '400mg/325mg', 45.00, 38.00, 350, false, 'Rack A-04'),
        ('Montair LC', 'Cipla', 'Montelukast + Levocetirizine', 'Allergy & Cold', 'Tablet', '10mg/5mg', 165.00, 145.00, 180, true, 'Rack E-05'),
        ('Becosules Z', 'Pfizer', 'Vitamin B-Complex with Zinc', 'Vitamins & Supplements', 'Capsule', 'Standard', 55.00, 48.00, 500, false, 'Rack F-01'),
        ('Omez 20', 'Dr. Reddy''s', 'Omeprazole', 'Stomach Care', 'Capsule', '20mg', 68.00, 58.00, 250, false, 'Rack C-04'),
        ('Calpol 500', 'GSK', 'Paracetamol', 'Fever & Pain', 'Tablet', '500mg', 22.00, 18.00, 300, false, 'Rack A-02'),
        ('Ciplox 500', 'Cipla', 'Ciprofloxacin', 'Antibiotics', 'Tablet', '500mg', 62.00, 52.00, 140, true, 'Rack B-08'),
        ('Voveran SR 100', 'Novartis', 'Diclofenac Sodium', 'Fever & Pain', 'Tablet', '100mg', 105.00, 92.00, 160, true, 'Rack A-08'),
        ('Amlong 5', 'Micro Labs', 'Amlodipine', 'Blood Pressure', 'Tablet', '5mg', 42.00, 36.00, 220, true, 'Rack D-07'),
        ('Asthalin Inhaler', 'Cipla', 'Salbutamol', 'Respiratory', 'Inhaler', '100mcg', 160.00, 140.00, 80, true, 'Rack E-09')
) AS m(name, brand, salt, category, dosage_form, strength, mrp, price, stock, requires_rx, rack_location)
WHERE NOT EXISTS (
    SELECT 1 FROM pharmacy_medicines pm WHERE pm.hospital_id = h.id AND pm.name = m.name
);

-- 8. Pre-seed default pharmacist staff accounts for each hospital
-- Password is 'Pharmacy@123' hashed with bcrypt ($2b$12$K8dZt99w0j6K8a5c3756ee3b118b6fc8e6c46b5a3e1a0b3c2d4e5 is a placeholder or bcrypt hash)
-- We will support standard bcrypt hashing
INSERT INTO pharmacy_staff (hospital_id, name, email, phone, password_hash, role)
SELECT 
    h.id,
    h.name || ' Pharmacist',
    'pharmacist' || h.id || '@medclues.com',
    '9876543210',
    '$2b$12$e68Y2kR4B1wE9q3G7zJ6/.b7QjO9uR3rN4aG5kL8wP2yM7vS1tE8O', -- 'Pharmacy@123'
    'pharmacist'
FROM hospital_tieups h
WHERE NOT EXISTS (
    SELECT 1 FROM pharmacy_staff ps WHERE ps.hospital_id = h.id
);
