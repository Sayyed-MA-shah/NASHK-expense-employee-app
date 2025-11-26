import { supabase } from '../supabase'
import { Database } from '@/types/database'

type EmployeeRow = Database['public']['Tables']['employees']['Row']
type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
type EmployeeUpdate = Database['public']['Tables']['employees']['Update']

type WorkRecordRow = Database['public']['Tables']['work_records']['Row']
type WorkRecordInsert = Database['public']['Tables']['work_records']['Insert']

type SalaryPaymentRow = Database['public']['Tables']['salary_payments']['Row']
type SalaryPaymentInsert = Database['public']['Tables']['salary_payments']['Insert']

type AdvanceRow = Database['public']['Tables']['advances']['Row']
type AdvanceInsert = Database['public']['Tables']['advances']['Insert']

type OvertimeRecordRow = Database['public']['Tables']['overtime_records']['Row']
type OvertimeRecordInsert = Database['public']['Tables']['overtime_records']['Insert']

// ============================================
// EMPLOYEES
// ============================================

export async function getEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as EmployeeRow[]
}

export async function getEmployeeById(id: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as EmployeeRow
}

export async function getEmployeesByType(type: 'contractual' | 'fixed') {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('type', type)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as EmployeeRow[]
}

export async function createEmployee(employee: EmployeeInsert) {
  const { data, error } = await supabase
    .from('employees')
    .insert(employee as any)
    .select()
    .single()
  
  if (error) throw error
  return data as EmployeeRow
}

export async function updateEmployee(id: string, employee: EmployeeUpdate) {
  const { data, error } = await supabase
    .from('employees')
    .update(employee as any)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as EmployeeRow
}

export async function deleteEmployee(id: string) {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// ============================================
// WORK RECORDS (Contractual Employees)
// ============================================

export async function getWorkRecordsByEmployee(employeeId: string) {
  const { data, error } = await supabase
    .from('work_records')
    .select('*')
    .eq('employee_id', employeeId)
    .order('date', { ascending: false })
  
  if (error) throw error
  return data as WorkRecordRow[]
}

export async function createWorkRecord(workRecord: WorkRecordInsert) {
  const { data, error } = await supabase
    .from('work_records')
    .insert(workRecord as any)
    .select()
    .single()
  
  if (error) throw error
  return data as WorkRecordRow
}

export async function updateWorkRecord(id: string, workRecord: Partial<WorkRecordInsert>) {
  const { data, error } = await supabase
    .from('work_records')
    .update(workRecord as any)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as WorkRecordRow
}

export async function deleteWorkRecord(id: string) {
  const { error } = await supabase
    .from('work_records')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// ============================================
// SALARY PAYMENTS
// ============================================

export async function getSalaryPaymentsByEmployee(employeeId: string) {
  const { data, error } = await supabase
    .from('salary_payments')
    .select('*')
    .eq('employee_id', employeeId)
    .order('payment_date', { ascending: false })
  
  if (error) throw error
  return data as SalaryPaymentRow[]
}

export async function createSalaryPayment(payment: SalaryPaymentInsert) {
  const { data, error } = await supabase
    .from('salary_payments')
    .insert(payment as any)
    .select()
    .single()
  
  if (error) throw error
  return data as SalaryPaymentRow
}

export async function updateSalaryPayment(id: string, payment: Partial<SalaryPaymentInsert>) {
  const { data, error } = await supabase
    .from('salary_payments')
    .update(payment as any)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as SalaryPaymentRow
}

export async function deleteSalaryPayment(id: string) {
  const { error } = await supabase
    .from('salary_payments')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// ============================================
// ADVANCES
// ============================================

export async function getAdvancesByEmployee(employeeId: string) {
  const { data, error } = await supabase
    .from('advances')
    .select('*')
    .eq('employee_id', employeeId)
    .order('payment_date', { ascending: false })
  
  if (error) throw error
  return data as AdvanceRow[]
}

export async function createAdvance(advance: AdvanceInsert) {
  const { data, error } = await supabase
    .from('advances')
    .insert(advance as any)
    .select()
    .single()
  
  if (error) throw error
  return data as AdvanceRow
}

// ============================================
// OVERTIME RECORDS (Fixed Employees)
// ============================================

export async function getOvertimeRecordsByEmployee(employeeId: string) {
  const { data, error } = await supabase
    .from('overtime_records')
    .select('*')
    .eq('employee_id', employeeId)
    .order('date', { ascending: false })
  
  if (error) throw error
  return data as OvertimeRecordRow[]
}

export async function createOvertimeRecord(overtime: OvertimeRecordInsert) {
  const { data, error } = await supabase
    .from('overtime_records')
    .insert(overtime as any)
    .select()
    .single()
  
  if (error) throw error
  return data as OvertimeRecordRow
}

export async function updateOvertimeRecord(id: string, overtime: Partial<OvertimeRecordInsert>) {
  const { data, error } = await supabase
    .from('overtime_records')
    .update(overtime as any)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as OvertimeRecordRow
}

export async function deleteOvertimeRecord(id: string) {
  const { error } = await supabase
    .from('overtime_records')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// ============================================
// EMPLOYEE STATISTICS
// ============================================

export async function getEmployeeStats() {
  const { data, error } = await supabase
    .rpc('employee_statistics')
  
  if (error) {
    // Fallback - calculate manually
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
    
    if (employeesError) throw employeesError
    
    const totalEmployees = employees?.length || 0
    const activeEmployees = employees?.filter(e => e.status === 'active').length || 0
    const contractualEmployees = employees?.filter(e => e.type === 'contractual').length || 0
    const fixedEmployees = employees?.filter(e => e.type === 'fixed').length || 0
    
    return {
      total_employees: totalEmployees,
      active_employees: activeEmployees,
      inactive_employees: totalEmployees - activeEmployees,
      contractual_employees: contractualEmployees,
      fixed_employees: fixedEmployees,
      total_contractual_earned: employees
        ?.filter(e => e.type === 'contractual')
        .reduce((sum, e) => sum + Number(e.total_earned || 0), 0) || 0,
      total_fixed_salaries: employees
        ?.filter(e => e.type === 'fixed')
        .reduce((sum, e) => sum + Number(e.monthly_salary || 0), 0) || 0,
      total_advances_paid: employees
        ?.reduce((sum, e) => sum + Number(e.advance_paid || 0), 0) || 0
    }
  }
  
  return data
}
