import { supabase } from '../supabase'
import { Database } from '@/types/database'

type PaymentRow = Database['public']['Tables']['payments']['Row']
type PaymentInsert = Database['public']['Tables']['payments']['Insert']
type PaymentUpdate = Database['public']['Tables']['payments']['Update']

// Get all payments
export async function getPayments() {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as PaymentRow[]
}

// Get payment by ID
export async function getPaymentById(id: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as PaymentRow
}

// Get payments by type (credit/debit)
export async function getPaymentsByType(type: 'credit' | 'debit') {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('type', type)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as PaymentRow[]
}

// Create new payment
export async function createPayment(payment: PaymentInsert) {
  const { data, error } = await supabase
    .from('payments')
    .insert(payment as any)
    .select()
    .single()
  
  if (error) throw error
  return data as PaymentRow
}

// Update payment
export async function updatePayment(id: string, payment: PaymentUpdate) {
  const { data, error } = await supabase
    .from('payments')
    .update(payment as any)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as PaymentRow
}

// Delete payment
export async function deletePayment(id: string) {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Get payment statistics
export async function getPaymentStats() {
  const { data, error } = await supabase
    .rpc('payment_statistics')
  
  if (error) {
    // Fallback if view doesn't work - calculate manually
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
    
    if (paymentsError) throw paymentsError
    
    const totalPayin = payments
      ?.filter(p => p.type === 'credit')
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0
    
    const totalPayout = payments
      ?.filter(p => p.type === 'debit')
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0
    
    return {
      total_payments: payments?.length || 0,
      total_amount: totalPayin + totalPayout,
      total_payin: totalPayin,
      total_payout: totalPayout
    }
  }
  
  return data
}
