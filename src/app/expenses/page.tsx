'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getExpenses, createExpense } from '@/lib/api'
import { 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  getExpenseCategoryIcon, 
  getExpenseCategoryName,
  getExpenseCategoryColor,
  generateId
} from '@/lib/utils'
import { ExpenseCategory } from '@/types'
import { 
  Plus, 
  Calendar, 
  Filter, 
  FileText, 
  TrendingUp,
  X,
  Trash2
} from 'lucide-react'

interface ExpenseRow {
  id: string
  date: string
  category: ExpenseCategory
  amount: string
  description: string
}

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<ExpenseCategory | 'all'>('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [expenseRows, setExpenseRows] = useState<ExpenseRow[]>([
    {
      id: '1',
      date: '',
      category: 'setup_purchase',
      amount: '',
      description: ''
    }
  ])
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const categories: ExpenseCategory[] = ['setup_purchase', 'rent_bill_guest', 'material', 'logistic', 'outsource']

  // Load expenses from Supabase on mount
  useEffect(() => {
    loadExpenses()
  }, [])

  async function loadExpenses() {
    try {
      setLoading(true)
      const data = await getExpenses()
      setExpenses(data || [])
    } catch (error) {
      console.error('Error loading expenses:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to load expenses: ${errorMessage}`)
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  // Filter expenses based on active tab and date range
  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory = activeTab === 'all' || expense.category === activeTab
    // expense.date is already a string from Supabase (YYYY-MM-DD format)
    const expenseDate = typeof expense.date === 'string' ? expense.date : new Date(expense.date).toISOString().split('T')[0]
    const matchesDateRange = (!dateRange.start || expenseDate >= dateRange.start) && 
                            (!dateRange.end || expenseDate <= dateRange.end)
    return matchesCategory && matchesDateRange
  })

  // Calculate category totals
  const categoryTotals = categories.reduce((acc, category) => {
    acc[category] = expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0)
    return acc
  }, {} as Record<ExpenseCategory, number>)

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Add expense form functions
  const addExpenseRow = () => {
    const newRow: ExpenseRow = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      category: 'setup_purchase',
      amount: '',
      description: ''
    }
    setExpenseRows([...expenseRows, newRow])
  }

  const removeExpenseRow = (id: string) => {
    if (expenseRows.length > 1) {
      setExpenseRows(expenseRows.filter(row => row.id !== id))
    }
  }

  const updateExpenseRow = (id: string, field: keyof ExpenseRow, value: string) => {
    setExpenseRows(expenseRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ))
  }

  const validateAndSubmit = async () => {
    const validRows = expenseRows.filter(row => 
      row.date && row.category && row.amount && parseFloat(row.amount) > 0 && row.description.trim()
    )
    
    if (validRows.length === 0) {
      alert('Please fill in all required fields for at least one expense row.')
      return
    }

    try {
      // Create expenses in Supabase
      for (const row of validRows) {
        const expenseData = {
          amount: parseFloat(row.amount),
          currency: 'PKR',
          category: row.category,
          status: 'approved',
          description: row.description,
          date: row.date, // YYYY-MM-DD format from HTML5 date input
          employee_id: 'emp_manual',
          employee_name: 'Manual Entry',
        }
        
        console.log('Creating expense:', expenseData)
        await createExpense(expenseData as any)
      }

      alert(`${validRows.length} expense(s) submitted successfully!`)
      
      // Reload expenses from database
      await loadExpenses()
      
      // Reset form
      setExpenseRows([{
        id: '1',
        date: '',
        category: 'setup_purchase',
        amount: '',
        description: ''
      }])
      setShowAddForm(false)
    } catch (error) {
      console.error('Error saving expenses:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to save expenses: ${errorMessage}`)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground">
              Track and manage your business expenses
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expenses
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {/* Total Expenses Card */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">
                All categories combined
              </p>
            </CardContent>
          </Card>

          {/* Category Cards */}
          {categories.map((category) => {
            const Icon = getExpenseCategoryIcon(category)
            const colorClass = getExpenseCategoryColor(category)
            
            return (
              <Card key={category} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium">
                    {getExpenseCategoryName(category)}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${colorClass.split(' ')[0]}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{formatCurrency(categoryTotals[category])}</div>
                  <p className="text-xs text-muted-foreground">
                    {expenses.filter(e => e.category === category).length} transactions
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-input rounded-md text-sm"
              placeholder="Start date"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-input rounded-md text-sm"
              placeholder="End date"
            />
          </div>
          
          {(dateRange.start || dateRange.end) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setDateRange({ start: '', end: '' })}
            >
              Clear Dates
            </Button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="space-y-4">
          <div className="flex space-x-1 rounded-lg bg-muted p-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({expenses.length})
            </button>
            {categories.map((category) => {
              const Icon = getExpenseCategoryIcon(category)
              const count = expenses.filter(e => e.category === category).length
              
              return (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`flex-shrink-0 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                    activeTab === category
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {getExpenseCategoryName(category)} ({count})
                </button>
              )
            })}
          </div>

          {/* Expenses Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' ? 'All Expenses' : `${getExpenseCategoryName(activeTab)} Expenses`}
              </CardTitle>
              <CardDescription>
                {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
                {(dateRange.start || dateRange.end) && ' in selected date range'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Date</th>
                      <th className="text-left p-2 font-medium">Category</th>
                      <th className="text-left p-2 font-medium">Amount</th>
                      <th className="text-left p-2 font-medium">Description/Notes</th>
                      <th className="text-left p-2 font-medium">Status</th>
                      <th className="text-left p-2 font-medium">Employee</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center p-8 text-muted-foreground">
                          Loading expenses...
                        </td>
                      </tr>
                    ) : filteredExpenses.length > 0 ? (
                      filteredExpenses.map((expense) => {
                        const Icon = getExpenseCategoryIcon(expense.category)
                        const colorClass = getExpenseCategoryColor(expense.category)
                        
                        return (
                          <tr key={expense.id} className="border-b hover:bg-muted/50">
                            <td className="p-2 text-sm">{formatDate(expense.date, 'short')}</td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${colorClass.split(' ')[0]}`} />
                                <span className="text-sm">{getExpenseCategoryName(expense.category)}</span>
                              </div>
                            </td>
                            <td className="p-2 font-medium">{formatCurrency(expense.amount)}</td>
                            <td className="p-2 text-sm max-w-xs truncate">{expense.description}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                                {expense.status}
                              </span>
                            </td>
                            <td className="p-2 text-sm">{expense.employeeName}</td>
                            <td className="p-2">
                              <Button variant="ghost" size="sm">View</Button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          No expenses found for the selected criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Expenses Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Add New Expenses</CardTitle>
                    <CardDescription>
                      Add multiple expense entries at once. All fields are required for each row.
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Date</th>
                        <th className="text-left p-2 font-medium">Category</th>
                        <th className="text-left p-2 font-medium">Amount</th>
                        <th className="text-left p-2 font-medium">Description/Notes</th>
                        <th className="text-left p-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenseRows.map((row) => (
                        <tr key={row.id} className="border-b">
                          <td className="p-2">
                            <input
                              type="date"
                              value={row.date}
                              onChange={(e) => updateExpenseRow(row.id, 'date', e.target.value)}
                              className="w-full px-2 py-1 border border-input rounded text-sm"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={row.category}
                              onChange={(e) => updateExpenseRow(row.id, 'category', e.target.value as ExpenseCategory)}
                              className="w-full px-2 py-1 border border-input rounded text-sm"
                              required
                            >
                              {categories.map((category) => (
                                <option key={category} value={category}>
                                  {getExpenseCategoryName(category)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.amount}
                              onChange={(e) => updateExpenseRow(row.id, 'amount', e.target.value)}
                              className="w-full px-2 py-1 border border-input rounded text-sm"
                              placeholder="0.00"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.description}
                              onChange={(e) => updateExpenseRow(row.id, 'description', e.target.value)}
                              className="w-full px-2 py-1 border border-input rounded text-sm"
                              placeholder="Enter description..."
                              required
                            />
                          </td>
                          <td className="p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExpenseRow(row.id)}
                              disabled={expenseRows.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={addExpenseRow}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Row
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={validateAndSubmit}>
                      Save All Expenses
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}