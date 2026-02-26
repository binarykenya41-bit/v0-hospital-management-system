-- Hospital Management System - Kenya Edition
-- Database Schema for Neon PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role_id INTEGER REFERENCES roles(id),
  department VARCHAR(100),
  phone VARCHAR(20),
  national_id VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 3. Patients table (Kenyan context)
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_number VARCHAR(20) NOT NULL UNIQUE,
  national_id VARCHAR(20),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  other_names VARCHAR(100),
  date_of_birth DATE,
  gender VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(255),
  county VARCHAR(50),
  sub_county VARCHAR(100),
  ward VARCHAR(100),
  address TEXT,
  blood_group VARCHAR(5),
  sha_number VARCHAR(30),
  insurance_provider VARCHAR(100),
  insurance_number VARCHAR(50),
  next_of_kin_name VARCHAR(200),
  next_of_kin_phone VARCHAR(20),
  next_of_kin_relationship VARCHAR(50),
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  referral_source VARCHAR(255),
  referral_hospital VARCHAR(255),
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 4. Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  doctor_id UUID REFERENCES users(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  appointment_type VARCHAR(50) NOT NULL,
  clinic VARCHAR(100),
  status VARCHAR(30) DEFAULT 'scheduled',
  priority VARCHAR(20) DEFAULT 'normal',
  reason TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 5. Admissions table
CREATE TABLE IF NOT EXISTS admissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  admitting_doctor_id UUID REFERENCES users(id),
  ward VARCHAR(100),
  bed_number VARCHAR(20),
  admission_date TIMESTAMPTZ DEFAULT NOW(),
  discharge_date TIMESTAMPTZ,
  admission_reason TEXT,
  discharge_summary TEXT,
  status VARCHAR(30) DEFAULT 'admitted',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 6. Medical records table
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  doctor_id UUID REFERENCES users(id),
  admission_id UUID REFERENCES admissions(id),
  appointment_id UUID REFERENCES appointments(id),
  record_type VARCHAR(50) NOT NULL,
  diagnosis TEXT,
  icd10_code VARCHAR(20),
  clinical_notes TEXT,
  treatment_plan TEXT,
  vitals JSONB,
  record_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 7. Lab tests table
CREATE TABLE IF NOT EXISTS lab_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  ordered_by UUID REFERENCES users(id),
  test_name VARCHAR(200) NOT NULL,
  test_category VARCHAR(100),
  urgency VARCHAR(20) DEFAULT 'routine',
  status VARCHAR(30) DEFAULT 'pending',
  ordered_date TIMESTAMPTZ DEFAULT NOW(),
  completed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Lab results table
CREATE TABLE IF NOT EXISTS lab_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_test_id UUID REFERENCES lab_tests(id),
  result_text TEXT,
  result_values JSONB,
  normal_range VARCHAR(100),
  is_abnormal BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),
  report_url VARCHAR(500),
  result_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  category VARCHAR(100),
  dosage_form VARCHAR(50),
  strength VARCHAR(50),
  unit VARCHAR(20),
  batch_number VARCHAR(50),
  manufacturer VARCHAR(200),
  supplier VARCHAR(200),
  quantity_in_stock INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  unit_price DECIMAL(12,2) DEFAULT 0,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  doctor_id UUID REFERENCES users(id),
  medical_record_id UUID REFERENCES medical_records(id),
  medicine_id UUID REFERENCES medicines(id),
  medicine_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  duration VARCHAR(50),
  quantity INTEGER,
  instructions TEXT,
  status VARCHAR(30) DEFAULT 'prescribed',
  dispensed_by UUID REFERENCES users(id),
  dispensed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number VARCHAR(30) NOT NULL UNIQUE,
  patient_id UUID REFERENCES patients(id),
  admission_id UUID REFERENCES admissions(id),
  total_amount DECIMAL(12,2) DEFAULT 0,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  balance DECIMAL(12,2) DEFAULT 0,
  payment_method VARCHAR(50),
  billing_type VARCHAR(30) DEFAULT 'cash',
  status VARCHAR(30) DEFAULT 'pending',
  sha_claim_status VARCHAR(30),
  notes TEXT,
  due_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 12. Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id),
  description VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(12,2) DEFAULT 0,
  total_price DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id),
  patient_id UUID REFERENCES patients(id),
  amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  reference_number VARCHAR(100),
  mpesa_code VARCHAR(20),
  received_by UUID REFERENCES users(id),
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. SHA Claims table (formerly NHIF)
CREATE TABLE IF NOT EXISTS sha_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  invoice_id UUID REFERENCES invoices(id),
  sha_number VARCHAR(30),
  claim_amount DECIMAL(12,2),
  approved_amount DECIMAL(12,2),
  claim_status VARCHAR(30) DEFAULT 'submitted',
  submission_date TIMESTAMPTZ DEFAULT NOW(),
  approval_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  quantity INTEGER DEFAULT 0,
  unit VARCHAR(30),
  reorder_level INTEGER DEFAULT 5,
  unit_cost DECIMAL(12,2) DEFAULT 0,
  department VARCHAR(100),
  supplier_id UUID,
  last_restock_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(200),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  county VARCHAR(50),
  supply_type VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Staff schedule table
CREATE TABLE IF NOT EXISTS staff_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  shift_date DATE NOT NULL,
  shift_type VARCHAR(30) NOT NULL,
  start_time TIME,
  end_time TIME,
  department VARCHAR(100),
  status VARCHAR(20) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(100),
  record_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Hospital Administrator'),
  ('superintendent', 'Medical Superintendent'),
  ('doctor', 'Doctor'),
  ('nurse', 'Nurse'),
  ('receptionist', 'Receptionist'),
  ('pharmacist', 'Pharmacist'),
  ('lab_tech', 'Laboratory Technologist'),
  ('accountant', 'Accountant'),
  ('records_officer', 'Records Officer'),
  ('patient', 'Patient Portal User')
ON CONFLICT (name) DO NOTHING;

-- Insert default admin user (password: Admin@123)
INSERT INTO users (email, password_hash, first_name, last_name, role_id, department, is_active)
VALUES (
  'admin@hospital.go.ke',
  '$2b$10$X7VYHy.BHQIz0YTr5y0wYeJGzGHvKQGO9Y0oB9FZxQW8kNlM0KGIW',
  'System',
  'Administrator',
  1,
  'Administration',
  true
) ON CONFLICT (email) DO NOTHING;
