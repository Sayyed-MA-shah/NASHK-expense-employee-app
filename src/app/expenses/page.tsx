'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { getExpenses, createExpense, deleteExpense, updateExpense } from '@/lib/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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
  Trash2,
  Pencil,
  AlertTriangle,
  FileDown
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [expenseToEdit, setExpenseToEdit] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    date: '',
    category: 'setup_purchase' as ExpenseCategory,
    amount: '',
    description: ''
  })
  const [validationDialogOpen, setValidationDialogOpen] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  const { toasts, toast, removeToast } = useToast()

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
      toast.error('Failed to load expenses', errorMessage)
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  function handleDeleteExpense(id: string) {
    setExpenseToDelete(id)
    setDeleteDialogOpen(true)
  }

  async function confirmDeleteExpense() {
    if (!expenseToDelete) return

    try {
      await deleteExpense(expenseToDelete)
      toast.success('Expense deleted', 'The expense has been deleted successfully')
      await loadExpenses()
    } catch (error) {
      console.error('Error deleting expense:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to delete expense', errorMessage)
    } finally {
      setDeleteDialogOpen(false)
      setExpenseToDelete(null)
    }
  }

  function handleEditExpense(expense: any) {
    setExpenseToEdit(expense)
    setEditForm({
      date: expense.date,
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description
    })
    setEditDialogOpen(true)
  }

  async function confirmEditExpense() {
    if (!expenseToEdit) return

    // Validate form
    if (!editForm.date || !editForm.category || !editForm.amount || !editForm.description.trim()) {
      setValidationMessage('Please fill in all required fields')
      setValidationDialogOpen(true)
      return
    }

    const amount = parseFloat(editForm.amount)
    if (isNaN(amount) || amount <= 0) {
      setValidationMessage('Please enter a valid amount greater than 0')
      setValidationDialogOpen(true)
      return
    }

    try {
      await updateExpense(expenseToEdit.id, {
        date: editForm.date,
        category: editForm.category,
        amount: amount,
        description: editForm.description
      })
      toast.success('Expense updated', 'The expense has been updated successfully')
      await loadExpenses()
      setEditDialogOpen(false)
      setExpenseToEdit(null)
    } catch (error) {
      console.error('Error updating expense:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to update expense', errorMessage)
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

  // Calculate category totals from filtered data
  const categoryTotals = categories.reduce((acc, category) => {
    acc[category] = filteredExpenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0)
    return acc
  }, {} as Record<ExpenseCategory, number>)

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

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
      setValidationMessage('Please fill in all required fields for at least one expense row.')
      setValidationDialogOpen(true)
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

      toast.success('Expenses submitted', `${validRows.length} expense(s) submitted successfully`)
      
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
      toast.error('Failed to save expenses', errorMessage)
    }
  }

  const generatePDFReport = () => {
    if (!dateRange.start && !dateRange.end) {
      setValidationMessage('Please select a date range to generate the report.')
      setValidationDialogOpen(true)
      return
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    
    // Company Header
    doc.setFillColor(41, 128, 185) // Professional blue
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('NASHK', 15, 20)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Expense & Employee Management System', 15, 27)
    
    // Report Title
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    const reportTitle = activeTab === 'all' ? 'ALL EXPENSES REPORT' : `${getExpenseCategoryName(activeTab).toUpperCase()} EXPENSES REPORT`
    doc.text(reportTitle, pageWidth / 2, 50, { align: 'center' })
    
    // Date Range
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    const dateRangeText = dateRange.start && dateRange.end 
      ? `Period: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`
      : dateRange.start 
      ? `From: ${new Date(dateRange.start).toLocaleDateString()}`
      : `Until: ${new Date(dateRange.end).toLocaleDateString()}`
    doc.text(dateRangeText, pageWidth / 2, 57, { align: 'center' })
    
    doc.setTextColor(0, 0, 0)
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 63, { align: 'center' })
    
    // Summary Box
    const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
    const expenseCount = filteredExpenses.length
    
    doc.setFillColor(240, 240, 240)
    doc.roundedRect(15, 70, pageWidth - 30, 22, 3, 3, 'F')
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    
    const summaryY = 80
    doc.text('Total Expenses:', 25, summaryY)
    doc.setTextColor(220, 0, 0)
    doc.text(formatCurrency(totalAmount), 80, summaryY)
    
    doc.setTextColor(0, 0, 0)
    doc.text('Number of Transactions:', 25, summaryY + 8)
    doc.text(expenseCount.toString(), 80, summaryY + 8)
    
    // Expenses Table
    const tableData = filteredExpenses.map(expense => [
      formatDate(expense.date, 'short'),
      getExpenseCategoryName(expense.category),
      expense.description.length > 40 ? expense.description.substring(0, 40) + '...' : expense.description,
      formatCurrency(expense.amount)
    ])
    
    autoTable(doc, {
      startY: 102,
      head: [['Date', 'Category', 'Description', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'left'
      },
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 85 },
        3: { cellWidth: 30, halign: 'right' }
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 15, right: 15 }
    })
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 102
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.setFont('helvetica', 'italic')
    doc.text(
      'This is a computer-generated report. For any discrepancies, please contact the finance department.',
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    )
    
    // Page numbers
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10)
    }
    
    // Open PDF in new window for preview (user can choose to print or save)
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    window.open(pdfUrl, '_blank')
    
    toast.success('Report Generated', 'Your expenses report has been opened in a new tab')
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
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expenses
          </Button>
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
              Clear
            </Button>
          )}
          <Button 
            onClick={generatePDFReport}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Generate Report
          </Button>
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
                      <th className="text-left p-2 font-medium">Description/Notes</th>
                      <th className="text-left p-2 font-medium">Amount</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-muted-foreground">
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
                            <td className="p-2 text-sm max-w-xs truncate">{expense.description}</td>
                            <td className="p-2 font-medium">{formatCurrency(expense.amount)}</td>
                            <td className="p-2">
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditExpense(expense)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
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
                        <th className="text-left p-2 font-medium">Description/Notes</th>
                        <th className="text-left p-2 font-medium">Amount</th>
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
                              type="text"
                              value={row.description}
                              onChange={(e) => updateExpenseRow(row.id, 'description', e.target.value)}
                              className="w-full px-2 py-1 border border-input rounded text-sm"
                              placeholder="Enter description..."
                              required
                            />
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

      {/* Edit Expense Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Update the expense details below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value as ExpenseCategory })}
                className="w-full px-3 py-2 border border-input rounded-md"
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {getExpenseCategoryName(category)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (PKR)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md min-h-[80px]"
                placeholder="Enter description..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false)
                setExpenseToEdit(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmEditExpense}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Expense
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setExpenseToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteExpense}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validation Dialog */}
      <Dialog open={validationDialogOpen} onOpenChange={setValidationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Validation Error
            </DialogTitle>
            <DialogDescription>
              {validationMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setValidationDialogOpen(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </DashboardLayout>
  )
}