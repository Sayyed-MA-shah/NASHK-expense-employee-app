import { supabase } from '../supabase'
import { Database } from '@/types/database'

type ExpenseRow = Database['public']['Tables']['expenses']['Row']
type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']

// Get all expenses
export async function getExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
  
  if (error) throw error
  return data as ExpenseRow[]
}

// Get expense by ID
export async function getExpenseById(id: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as ExpenseRow
}

// Get expenses by status
export async function getExpensesByStatus(status: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('status', status)
    .order('date', { ascending: false })
  
  if (error) throw error
  return data as ExpenseRow[]
}

// Get expenses by category
export async function getExpensesByCategory(category: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('category', category)
    .order('date', { ascending: false })
  
  if (error) throw error
  return data as ExpenseRow[]
}

// Create new expense
export async function createExpense(expense: ExpenseInsert) {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense as any)
    .select()
    .single()
  
  if (error) throw error
  return data as ExpenseRow
}

// Update expense
export async function updateExpense(id: string, expense: ExpenseUpdate) {
  const { data, error } = await supabase
    .from('expenses')
    .update(expense as any)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as ExpenseRow
}

// Delete expense
export async function deleteExpense(id: string) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Approve expense
export async function approveExpense(id: string, approvedBy: string) {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString()
    } as any)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as ExpenseRow
}

// Reject expense
export async function rejectExpense(id: string, reason: string) {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      status: 'rejected',
      rejection_reason: reason
    } as any)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as ExpenseRow
}

// Get expense statistics
export async function getExpenseStats() {
  const { data, error } = await supabase
    .rpc('expense_statistics')
  
  if (error) {
    // Fallback - calculate manually
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
    
    if (expensesError) throw expensesError
    
    const totalAmount = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0
    const pendingAmount = expenses
      ?.filter(e => e.status === 'submitted')
      .reduce((sum, e) => sum + Number(e.amount), 0) || 0
    const approvedAmount = expenses
      ?.filter(e => e.status === 'approved')
      .reduce((sum, e) => sum + Number(e.amount), 0) || 0
    const rejectedAmount = expenses
      ?.filter(e => e.status === 'rejected')
      .reduce((sum, e) => sum + Number(e.amount), 0) || 0
    
    return {
      total_expenses: expenses?.length || 0,
      total_amount: totalAmount,
      pending_amount: pendingAmount,
      approved_amount: approvedAmount,
      rejected_amount: rejectedAmount
    }
  }
  
  return data
}
