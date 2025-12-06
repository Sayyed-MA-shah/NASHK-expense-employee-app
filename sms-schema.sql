-- SMS System Tables
-- Run this in Supabase SQL Editor to add SMS functionality

-- SMS Settings Table
CREATE TABLE IF NOT EXISTS sms_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enabled BOOLEAN DEFAULT FALSE,
  test_mode BOOLEAN DEFAULT TRUE,
  twilio_account_sid TEXT,
  twilio_auth_token TEXT,
  twilio_phone_number TEXT,
  notify_on_salary_payment BOOLEAN DEFAULT TRUE,
  notify_on_work_assignment BOOLEAN DEFAULT FALSE,
  notify_on_advance_payment BOOLEAN DEFAULT TRUE,
  notify_on_overtime BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- SMS Logs Table
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL,
  status TEXT NOT NULL, -- 'sent', 'failed', 'test'
  twilio_message_id TEXT,
  error_message TEXT,
  test_mode BOOLEAN DEFAULT FALSE,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert default SMS settings
INSERT INTO sms_settings (enabled, test_mode)
VALUES (FALSE, TRUE)
ON CONFLICT DO NOTHING;

-- Create updated_at trigger for sms_settings
CREATE OR REPLACE FUNCTION update_sms_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sms_settings_updated_at
  BEFORE UPDATE ON sms_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_sms_settings_updated_at();

-- Add RLS policies
ALTER TABLE sms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Allow all access for now (update with proper auth later)
CREATE POLICY "Allow all access to sms_settings" ON sms_settings FOR ALL USING (true);
CREATE POLICY "Allow all access to sms_logs" ON sms_logs FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sms_logs_employee_id ON sms_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON sms_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON sms_logs(status);
CREATE INDEX IF NOT EXISTS idx_sms_logs_message_type ON sms_logs(message_type);
