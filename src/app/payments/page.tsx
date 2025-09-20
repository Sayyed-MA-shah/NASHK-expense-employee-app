'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockPayments } from '@/lib/mockData'
import { formatCurrency, formatDate, getStatusColor, generateId } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Calendar, Plus, X, Trash2 } from 'lucide-react'

interface PaymentRow {
  id: string
  date: string
  description: string
  amount: string
  type: 'payin' | 'payout'
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<'payin' | 'payout'>('payin')
  const [dateFilter, setDateFilter] = useState('')
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false)
  const [paymentRows, setPaymentRows] = useState<PaymentRow[]>([
    {
      id: '1',
      date: '',
      description: '',
      amount: '',
      type: 'payin'
    }
  ])
  const [payments, setPayments] = useState(mockPayments)

  // Filter payments based on type and date
  const filteredPayments = payments.filter(payment => {
    const matchesType = activeTab === 'payin' ? payment.type === 'credit' : payment.type === 'debit'
    const matchesDate = !dateFilter || payment.createdAt.toDateString() === new Date(dateFilter).toDateString()
    return matchesType && matchesDate
  })

  // Calculate KPI values
  const totalPayin = payments
    .filter(p => p.type === 'credit')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const totalPayout = payments
    .filter(p => p.type === 'debit')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const balance = totalPayin - totalPayout

  // Payment form functions
  const addPaymentRow = () => {
    const newRow: PaymentRow = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      type: 'payin'
    }
    setPaymentRows([...paymentRows, newRow])
  }

  const removePaymentRow = (id: string) => {
    if (paymentRows.length > 1) {
      setPaymentRows(paymentRows.filter(row => row.id !== id))
    }
  }

  const updatePaymentRow = (id: string, field: keyof PaymentRow, value: string) => {
    setPaymentRows(paymentRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ))
  }

  const validateAndSubmitPayments = () => {
    const validRows = paymentRows.filter(row => 
      row.date && row.description.trim() && row.amount && parseFloat(row.amount) > 0 && row.type
    )
    
    if (validRows.length === 0) {
      alert('Please fill in all required fields for at least one payment row.')
      return
    }

    // Create new payments and add to state
    const newPayments = validRows.map(row => ({
      id: generateId(),
      amount: parseFloat(row.amount),
      currency: 'USD',
      status: 'completed' as const,
      type: row.type === 'payin' ? ('credit' as const) : ('debit' as const),
      method: 'bank_transfer' as const,
      description: row.description,
      reference: `PAY-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      customerId: 'cust_manual',
      customerName: 'Manual Entry',
      customerEmail: 'manual@entry.com',
      transactionFee: 0,
      netAmount: parseFloat(row.amount),
      createdAt: new Date(row.date + 'T12:00:00Z'),
      updatedAt: new Date()
    }))

    // Add new payments to the state
    setPayments(prev => [...newPayments, ...prev])

    alert(`${validRows.length} payment(s) saved successfully!`)
    
    // Reset form
    setPaymentRows([{
      id: '1',
      date: '',
      description: '',
      amount: '',
      type: 'payin'
    }])
    setShowAddPaymentForm(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground">
              Manage and track your payment transactions
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payin</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPayin)}</div>
              <p className="text-xs text-muted-foreground">
                Money received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payout</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalPayout)}</div>
              <p className="text-xs text-muted-foreground">
                Money sent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(balance))}
              </div>
              <p className="text-xs text-muted-foreground">
                {balance >= 0 ? 'Positive balance' : 'Negative balance'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button className="flex items-center gap-2" onClick={() => setShowAddPaymentForm(true)}>
              <Plus className="h-4 w-4" />
              Add New Payment
            </Button>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm"
                placeholder="Filter by date"
              />
              {dateFilter && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setDateFilter('')}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-4">
          <div className="flex space-x-1 rounded-lg bg-muted p-1">
            <button
              onClick={() => setActiveTab('payin')}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                activeTab === 'payin'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Payin ({payments.filter(p => p.type === 'credit').length})
            </button>
            <button
              onClick={() => setActiveTab('payout')}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                activeTab === 'payout'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Payout ({payments.filter(p => p.type === 'debit').length})
            </button>
          </div>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'payin' ? 'Payin Transactions' : 'Payout Transactions'}
              </CardTitle>
              <CardDescription>
                {filteredPayments.length} {activeTab} transaction{filteredPayments.length !== 1 ? 's' : ''}
                {dateFilter && ` on ${new Date(dateFilter).toLocaleDateString()}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Reference</th>
                      <th className="text-left p-2 font-medium">
                        {activeTab === 'payin' ? 'From' : 'To'}
                      </th>
                      <th className="text-left p-2 font-medium">Amount</th>
                      <th className="text-left p-2 font-medium">Method</th>
                      <th className="text-left p-2 font-medium">Status</th>
                      <th className="text-left p-2 font-medium">Date</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-mono text-sm">{payment.reference}</td>
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{payment.customerName}</p>
                              <p className="text-sm text-muted-foreground">{payment.customerEmail}</p>
                            </div>
                          </td>
                          <td className="p-2 font-medium">
                            <span className={activeTab === 'payin' ? 'text-green-600' : 'text-red-600'}>
                              {activeTab === 'payin' ? '+' : '-'}{formatCurrency(payment.amount)}
                            </span>
                          </td>
                          <td className="p-2 capitalize">{payment.method.replace('_', ' ')}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="p-2 text-sm">{formatDate(payment.createdAt, 'short')}</td>
                          <td className="p-2">
                            <Button variant="ghost" size="sm">View</Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          No {activeTab} transactions found
                          {dateFilter && ' for the selected date'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Payment Form Modal */}
        {showAddPaymentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Add New Payment</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddPaymentForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {paymentRows.map((row, index) => (
                  <div key={row.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Payment {index + 1}</h3>
                      {paymentRows.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePaymentRow(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Input
                          type="date"
                          value={row.date}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePaymentRow(row.id, 'date', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input
                          placeholder="Enter description"
                          value={row.description}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePaymentRow(row.id, 'description', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Amount</label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          value={row.amount}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePaymentRow(row.id, 'amount', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <Select
                          value={row.type}
                          onValueChange={(value: string) => updatePaymentRow(row.id, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="payin">Pay In</SelectItem>
                            <SelectItem value="payout">Pay Out</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addPaymentRow}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Payment
                </Button>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowAddPaymentForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={validateAndSubmitPayments}>
                  Save Payments
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}