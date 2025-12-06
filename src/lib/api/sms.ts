import { supabase } from '../supabase'

// SMS Settings
export async function getSMSSettings() {
  const { data, error } = await supabase
    .from('sms_settings')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    // If no settings exist, create default settings
    if (error.code === 'PGRST116') {
      const { data: newData, error: insertError } = await supabase
        .from('sms_settings')
        .insert([{
          enabled: false,
          test_mode: true,
          notify_on_salary_payment: true,
          notify_on_work_assignment: false,
          notify_on_advance_payment: true,
          notify_on_overtime: false,
        }])
        .select()
        .single()
      
      if (insertError) throw insertError
      return newData
    }
    throw error
  }
  return data
}

export async function updateSMSSettings(settings: any) {
  // Get the first settings record
  const { data: existingData } = await supabase
    .from('sms_settings')
    .select('id')
    .limit(1)
    .single()

  if (!existingData) {
    // Create new settings if none exist
    const { data, error } = await supabase
      .from('sms_settings')
      .insert([settings])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update existing settings
  const { data, error } = await supabase
    .from('sms_settings')
    .update(settings)
    .eq('id', existingData.id)
    .select()
    .single()

  if (error) throw error
  return data
}

// SMS Logs
export async function getAllSMSLogs() {
  const { data, error } = await supabase
    .from('sms_logs')
    .select(`
      *,
      employees (
        first_name,
        last_name,
        phone
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createSMSLog(log: {
  phone_number: string
  message: string
  message_type: string
  status: string
  twilio_message_id?: string
  error_message?: string
  test_mode: boolean
  employee_id?: string
}) {
  const { data, error } = await supabase
    .from('sms_logs')
    .insert([log])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getSMSLogsByEmployee(employeeId: string) {
  const { data, error } = await supabase
    .from('sms_logs')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getSMSStats() {
  const { data: logs, error } = await supabase
    .from('sms_logs')
    .select('status, test_mode')

  if (error) throw error

  const stats = {
    total: logs?.length || 0,
    sent: logs?.filter((l: any) => l.status === 'sent' && !l.test_mode).length || 0,
    failed: logs?.filter((l: any) => l.status === 'failed').length || 0,
    test: logs?.filter((l: any) => l.test_mode).length || 0,
  }

  return stats
}
