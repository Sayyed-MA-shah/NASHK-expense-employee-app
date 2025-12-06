-- NASHAK Expense & Employee Management System
-- Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- EMPLOYEES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('contractual', 'fixed')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  hire_date DATE NOT NULL,
  
  -- For fixed employees
  monthly_salary DECIMAL(10,2),
  paid_amount DECIMAL(10,2) DEFAULT 0,
  
  -- For contractual employees
  total_earned DECIMAL(10,2) DEFAULT 0,
  advance_paid DECIMAL(10,2) DEFAULT 0,
  
  -- Common fields
  balance DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- WORK RECORDS TABLE (For Contractual Employees)
-- ============================================
CREATE TABLE IF NOT EXISTS work_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SALARY PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS salary_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  work_record_ids UUID[],
  is_advance_deduction BOOLEAN DEFAULT FALSE,
  notes TEXT,
  month VARCHAR(7), -- Format: YYYY-MM (for fixed employees)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ADVANCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS advances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  reason TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- OVERTIME RECORDS TABLE (For Fixed Employees)
-- ============================================
CREATE TABLE IF NOT EXISTS overtime_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours DECIMAL(10,2) NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'completed',
  type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit')),
  method VARCHAR(50) DEFAULT 'bank_transfer',
  description TEXT NOT NULL,
  reference VARCHAR(100) NOT NULL UNIQUE,
  customer_id VARCHAR(100),
  customer_name VARCHAR(200),
  customer_email VARCHAR(200),
  transaction_fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  category VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'submitted',
  description TEXT NOT NULL,
  date DATE NOT NULL,
  employee_id VARCHAR(100) NOT NULL,
  employee_name VARCHAR(200) NOT NULL,
  receipt VARCHAR(500),
  approved_by VARCHAR(100),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  tags TEXT[],
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Employee indexes
CREATE INDEX idx_employees_type ON employees(type);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_role ON employees(role);

-- Work records indexes
CREATE INDEX idx_work_records_employee ON work_records(employee_id);
CREATE INDEX idx_work_records_date ON work_records(date);

-- Salary payments indexes
CREATE INDEX idx_salary_payments_employee ON salary_payments(employee_id);
CREATE INDEX idx_salary_payments_date ON salary_payments(payment_date);

-- Advances indexes
CREATE INDEX idx_advances_employee ON advances(employee_id);
CREATE INDEX idx_advances_date ON advances(payment_date);

-- Overtime indexes
CREATE INDEX idx_overtime_employee ON overtime_records(employee_id);
CREATE INDEX idx_overtime_date ON overtime_records(date);

-- Payments indexes
CREATE INDEX idx_payments_type ON payments(type);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(created_at);
CREATE INDEX idx_payments_reference ON payments(reference);

-- Expenses indexes
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_employee ON expenses(employee_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_records_updated_at BEFORE UPDATE ON work_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salary_payments_updated_at BEFORE UPDATE ON salary_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advances_updated_at BEFORE UPDATE ON advances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_overtime_records_updated_at BEFORE UPDATE ON overtime_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow all operations for now - customize based on your auth needs)
CREATE POLICY "Allow all access to employees" ON employees FOR ALL USING (true);
CREATE POLICY "Allow all access to work_records" ON work_records FOR ALL USING (true);
CREATE POLICY "Allow all access to salary_payments" ON salary_payments FOR ALL USING (true);
CREATE POLICY "Allow all access to advances" ON advances FOR ALL USING (true);
CREATE POLICY "Allow all access to overtime_records" ON overtime_records FOR ALL USING (true);
CREATE POLICY "Allow all access to payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all access to expenses" ON expenses FOR ALL USING (true);

-- ============================================
-- VIEWS FOR STATISTICS
-- ============================================

-- Employee statistics view
CREATE OR REPLACE VIEW employee_statistics AS
SELECT
  COUNT(*) as total_employees,
  COUNT(*) FILTER (WHERE status = 'active') as active_employees,
  COUNT(*) FILTER (WHERE status = 'inactive') as inactive_employees,
  COUNT(*) FILTER (WHERE type = 'contractual') as contractual_employees,
  COUNT(*) FILTER (WHERE type = 'fixed') as fixed_employees,
  COALESCE(SUM(total_earned) FILTER (WHERE type = 'contractual'), 0) as total_contractual_earned,
  COALESCE(SUM(monthly_salary) FILTER (WHERE type = 'fixed'), 0) as total_fixed_salaries,
  COALESCE(SUM(advance_paid), 0) as total_advances_paid
FROM employees;

-- Payment statistics view
CREATE OR REPLACE VIEW payment_statistics AS
SELECT
  COUNT(*) as total_payments,
  COALESCE(SUM(amount), 0) as total_amount,
  COALESCE(SUM(amount) FILTER (WHERE type = 'credit'), 0) as total_payin,
  COALESCE(SUM(amount) FILTER (WHERE type = 'debit'), 0) as total_payout
FROM payments;

-- Expense statistics view
CREATE OR REPLACE VIEW expense_statistics AS
SELECT
  COUNT(*) as total_expenses,
  COALESCE(SUM(amount), 0) as total_amount,
  COALESCE(SUM(amount) FILTER (WHERE status = 'submitted'), 0) as pending_amount,
  COALESCE(SUM(amount) FILTER (WHERE status = 'approved'), 0) as approved_amount,
  COALESCE(SUM(amount) FILTER (WHERE status = 'rejected'), 0) as rejected_amount
FROM expenses;
