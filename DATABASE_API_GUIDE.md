# 🚀 Supabase Integration - Developer Guide

## 📁 Project Structure

```
dashboard/
├── src/
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client configuration
│   │   └── api/                 # API functions for database operations
│   │       ├── index.ts         # Export all API functions
│   │       ├── payments.ts      # Payment CRUD operations
│   │       ├── expenses.ts      # Expense CRUD operations
│   │       └── employees.ts     # Employee CRUD operations
│   └── types/
│       └── database.ts          # Database type definitions
├── .env.local                   # Local environment variables (DO NOT COMMIT)
├── .env.example                 # Environment template
└── supabase-schema.sql          # Database schema SQL
```

---

## 🔧 Using the API Functions

### Import the Functions

```typescript
import { 
  getPayments, 
  createPayment, 
  updatePayment, 
  deletePayment 
} from '@/lib/api'
```

### Example Usage in Components

#### 1. Fetching Data

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getPayments } from '@/lib/api'

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPayments() {
      try {
        const data = await getPayments()
        setPayments(data)
      } catch (error) {
        console.error('Error loading payments:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadPayments()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {payments.map(payment => (
        <div key={payment.id}>{payment.description}</div>
      ))}
    </div>
  )
}
```

#### 2. Creating Data

```typescript
import { createPayment } from '@/lib/api'

async function handleAddPayment() {
  try {
    const newPayment = await createPayment({
      amount: 1000,
      type: 'credit',
      description: 'New payment',
      reference: 'PAY-2025-001'
    })
    
    console.log('Payment created:', newPayment)
    // Refresh your list or update state
  } catch (error) {
    console.error('Error creating payment:', error)
    alert('Failed to create payment')
  }
}
```

#### 3. Updating Data

```typescript
import { updatePayment } from '@/lib/api'

async function handleUpdatePayment(paymentId: string) {
  try {
    const updated = await updatePayment(paymentId, {
      amount: 1500,
      description: 'Updated description'
    })
    
    console.log('Payment updated:', updated)
  } catch (error) {
    console.error('Error updating payment:', error)
  }
}
```

#### 4. Deleting Data

```typescript
import { deletePayment } from '@/lib/api'

async function handleDeletePayment(paymentId: string) {
  if (!confirm('Are you sure?')) return
  
  try {
    await deletePayment(paymentId)
    console.log('Payment deleted')
    // Refresh your list
  } catch (error) {
    console.error('Error deleting payment:', error)
  }
}
```

---

## 📊 Available API Functions

### Payments API (`payments.ts`)

```typescript
// Get all payments
const payments = await getPayments()

// Get payment by ID
const payment = await getPaymentById('uuid-here')

// Get payments by type
const payins = await getPaymentsByType('credit')
const payouts = await getPaymentsByType('debit')

// Create payment
const newPayment = await createPayment({
  amount: 1000,
  type: 'credit',
  description: 'Payment description',
  reference: 'PAY-2025-001'
})

// Update payment
const updated = await updatePayment('uuid-here', {
  amount: 1500
})

// Delete payment
await deletePayment('uuid-here')

// Get payment statistics
const stats = await getPaymentStats()
```

### Expenses API (`expenses.ts`)

```typescript
// Get all expenses
const expenses = await getExpenses()

// Get expense by ID
const expense = await getExpenseById('uuid-here')

// Get by status/category
const pending = await getExpensesByStatus('submitted')
const materials = await getExpensesByCategory('material')

// Create expense
const newExpense = await createExpense({
  amount: 500,
  category: 'material',
  description: 'Office supplies',
  date: '2025-11-24',
  employee_id: 'emp-uuid',
  employee_name: 'John Doe'
})

// Approve/Reject
await approveExpense('uuid-here', 'manager-id')
await rejectExpense('uuid-here', 'Insufficient details')

// Get statistics
const stats = await getExpenseStats()
```

### Employees API (`employees.ts`)

```typescript
// Get all employees
const employees = await getEmployees()

// Get by type
const contractual = await getEmployeesByType('contractual')
const fixed = await getEmployeesByType('fixed')

// Create employee
const newEmployee = await createEmployee({
  first_name: 'John',
  last_name: 'Doe',
  phone: '+1234567890',
  role: 'developer',
  type: 'contractual',
  hire_date: '2025-11-24'
})

// Work records (contractual)
const workRecords = await getWorkRecordsByEmployee('employee-uuid')
await createWorkRecord({
  employee_id: 'employee-uuid',
  date: '2025-11-24',
  description: 'Development work',
  quantity: 8,
  price: 25,
  total: 200
})

// Salary payments
const payments = await getSalaryPaymentsByEmployee('employee-uuid')
await createSalaryPayment({
  employee_id: 'employee-uuid',
  amount: 1000,
  payment_date: '2025-11-24'
})

// Advances
const advances = await getAdvancesByEmployee('employee-uuid')
await createAdvance({
  employee_id: 'employee-uuid',
  amount: 200,
  payment_date: '2025-11-24',
  reason: 'Emergency'
})

// Overtime (fixed employees)
const overtime = await getOvertimeRecordsByEmployee('employee-uuid')
await createOvertimeRecord({
  employee_id: 'employee-uuid',
  date: '2025-11-24',
  hours: 4,
  rate: 30,
  amount: 120,
  total: 120
})

// Get statistics
const stats = await getEmployeeStats()
```

---

## 🔄 Migration from Mock Data

### Before (Mock Data)
```typescript
import { mockPayments } from '@/lib/mockData'

const [payments, setPayments] = useState(mockPayments)
```

### After (Supabase)
```typescript
import { getPayments } from '@/lib/api'

const [payments, setPayments] = useState([])

useEffect(() => {
  getPayments().then(setPayments)
}, [])
```

---

## ⚡ Real-time Subscriptions (Optional)

Subscribe to changes in your tables:

```typescript
import { supabase } from '@/lib/supabase'

// Subscribe to payment changes
const subscription = supabase
  .channel('payments')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'payments' },
    (payload) => {
      console.log('Change received!', payload)
      // Refresh your data
    }
  )
  .subscribe()

// Cleanup
return () => {
  subscription.unsubscribe()
}
```

---

## 🛡️ Error Handling

Always wrap API calls in try-catch:

```typescript
async function loadData() {
  try {
    const data = await getPayments()
    setPayments(data)
  } catch (error) {
    console.error('Database error:', error)
    // Show user-friendly error message
    alert('Failed to load data. Please try again.')
  }
}
```

---

## 🧪 Testing Database Connection

Create a test component:

```typescript
// src/app/test-db/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDB() {
  const [result, setResult] = useState('')

  async function testConnection() {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('count')
      
      if (error) throw error
      setResult('✅ Connection successful!')
    } catch (error) {
      setResult('❌ Connection failed: ' + error.message)
    }
  }

  return (
    <div>
      <button onClick={testConnection}>Test Connection</button>
      <p>{result}</p>
    </div>
  )
}
```

---

## 📝 Type Safety

All functions are fully typed using Supabase's generated types:

```typescript
import { Database } from '@/types/database'

type Payment = Database['public']['Tables']['payments']['Row']
type PaymentInsert = Database['public']['Tables']['payments']['Insert']
```

---

## 🔍 Debugging Tips

1. **Check environment variables:**
   ```typescript
   console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
   ```

2. **Enable Supabase logs** in Supabase Dashboard → Logs

3. **Check browser console** for API errors

4. **Verify RLS policies** in Supabase Dashboard → Authentication → Policies

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

**Last Updated:** November 24, 2025  
**Supabase Client Version:** Latest
