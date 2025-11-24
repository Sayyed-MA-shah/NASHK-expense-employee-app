export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          first_name: string
          last_name: string
          phone: string
          role: string
          type: 'contractual' | 'fixed'
          status: 'active' | 'inactive'
          hire_date: string
          monthly_salary: number | null
          total_earned: number | null
          advance_paid: number | null
          paid_amount: number | null
          balance: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          phone: string
          role: string
          type: 'contractual' | 'fixed'
          status?: 'active' | 'inactive'
          hire_date: string
          monthly_salary?: number | null
          total_earned?: number | null
          advance_paid?: number | null
          paid_amount?: number | null
          balance?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          phone?: string
          role?: string
          type?: 'contractual' | 'fixed'
          status?: 'active' | 'inactive'
          hire_date?: string
          monthly_salary?: number | null
          total_earned?: number | null
          advance_paid?: number | null
          paid_amount?: number | null
          balance?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      work_records: {
        Row: {
          id: string
          employee_id: string
          date: string
          description: string
          quantity: number
          price: number
          total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          date: string
          description: string
          quantity: number
          price: number
          total: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          date?: string
          description?: string
          quantity?: number
          price?: number
          total?: number
          created_at?: string
          updated_at?: string
        }
      }
      salary_payments: {
        Row: {
          id: string
          employee_id: string
          amount: number
          payment_date: string
          work_record_ids: string[] | null
          is_advance_deduction: boolean
          notes: string | null
          month: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          amount: number
          payment_date: string
          work_record_ids?: string[] | null
          is_advance_deduction?: boolean
          notes?: string | null
          month?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          amount?: number
          payment_date?: string
          work_record_ids?: string[] | null
          is_advance_deduction?: boolean
          notes?: string | null
          month?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      advances: {
        Row: {
          id: string
          employee_id: string
          amount: number
          payment_date: string
          reason: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          amount: number
          payment_date: string
          reason?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          amount?: number
          payment_date?: string
          reason?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      overtime_records: {
        Row: {
          id: string
          employee_id: string
          date: string
          hours: number
          rate: number
          amount: number
          total: number
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          date: string
          hours: number
          rate: number
          amount: number
          total: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          date?: string
          hours?: number
          rate?: number
          amount?: number
          total?: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          amount: number
          currency: string
          status: string
          type: 'credit' | 'debit'
          method: string
          description: string
          reference: string
          customer_id: string | null
          customer_name: string | null
          customer_email: string | null
          transaction_fee: number | null
          net_amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          amount: number
          currency?: string
          status?: string
          type: 'credit' | 'debit'
          method?: string
          description: string
          reference: string
          customer_id?: string | null
          customer_name?: string | null
          customer_email?: string | null
          transaction_fee?: number | null
          net_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          amount?: number
          currency?: string
          status?: string
          type?: 'credit' | 'debit'
          method?: string
          description?: string
          reference?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_email?: string | null
          transaction_fee?: number | null
          net_amount?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          amount: number
          currency: string
          category: string
          status: string
          description: string
          date: string
          employee_id: string
          employee_name: string
          receipt: string | null
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          tags: string[] | null
          is_recurring: boolean | null
          recurring_frequency: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          amount: number
          currency?: string
          category: string
          status?: string
          description: string
          date: string
          employee_id: string
          employee_name: string
          receipt?: string | null
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          tags?: string[] | null
          is_recurring?: boolean | null
          recurring_frequency?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          amount?: number
          currency?: string
          category?: string
          status?: string
          description?: string
          date?: string
          employee_id?: string
          employee_name?: string
          receipt?: string | null
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          tags?: string[] | null
          is_recurring?: boolean | null
          recurring_frequency?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
