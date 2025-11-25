'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ToastContainer, useToast } from '@/components/ui/toast'
import { getEmployees, createEmployee, deleteEmployee, updateEmployee, getWorkRecordsByEmployee, getSalaryPaymentsByEmployee } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { 
  Plus, 
  Search, 
  X,
  Trash2,
  UserPlus,
  Briefcase,
  Pencil,
  AlertTriangle
} from 'lucide-react'

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [employeeToEdit, setEmployeeToEdit] = useState<any>(null)
  const { toasts, toast, removeToast } = useToast()

  const [addForm, setAddForm] = useState({
    fullName: '',
    phone: '',
    role: ''
  })

  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    role: ''
  })

  useEffect(() => {
    loadEmployees()
  }, [])

  async function loadEmployees() {
    try {
      setLoading(true)
      const data = await getEmployees()
      
      // Fetch work records and salary payments for each employee to calculate real totals
      const employeesWithTotals = await Promise.all(
        (data || []).map(async (emp) => {
          try {
            const [workRecords, salaryPayments] = await Promise.all([
              getWorkRecordsByEmployee(emp.id),
              getSalaryPaymentsByEmployee(emp.id)
            ])
            
            const totalEarned = workRecords.reduce((sum, wr) => sum + (wr.quantity * wr.price), 0)
            const totalPaid = salaryPayments.reduce((sum, sp) => sum + sp.amount, 0)
            const balance = totalEarned - totalPaid
            
            return {
              ...emp,
              total_earned: totalEarned,
              advance_paid: totalPaid,
              balance: balance
            }
          } catch (error) {
            console.error(`Error loading data for employee ${emp.id}:`, error)
            return emp
          }
        })
      )
      
      setEmployees(employeesWithTotals)
    } catch (error) {
      console.error('Error loading employees:', error)
      toast.error('Failed to load employees', error instanceof Error ? error.message : 'Unknown error')
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  // Filter only contractual employees
  const contractualEmployees = employees.filter(emp => 
    emp.type === 'contractual' && 
    (searchTerm === '' || 
     `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
     emp.phone.includes(searchTerm))
  )

  // Calculate stats
  const totalEmployees = contractualEmployees.length
  const tempPaidSalary = contractualEmployees.reduce((sum, emp) => sum + (emp.advance_paid || 0), 0)
  const dueSalaryTotal = contractualEmployees.reduce((sum, emp) => sum + (emp.balance || 0), 0)

  async function handleAddEmployee() {
    if (!addForm.fullName.trim() || !addForm.phone.trim() || !addForm.role.trim()) {
      toast.warning('Missing Fields', 'Please fill in all required fields')
      return
    }

    const nameParts = addForm.fullName.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || firstName

    try {
      await createEmployee({
        first_name: firstName,
        last_name: lastName,
        phone: addForm.phone,
        role: addForm.role,
        type: 'contractual',
        status: 'active',
        hire_date: new Date().toISOString().split('T')[0],
        total_earned: 0,
        advance_paid: 0,
        balance: 0
      })

      toast.success('Employee Added', 'Temp employee has been added successfully')
      await loadEmployees()
      setShowAddForm(false)
      setAddForm({ fullName: '', phone: '', role: '' })
    } catch (error) {
      console.error('Error adding employee:', error)
      toast.error('Failed to add employee', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  function handleEditEmployee(employee: any) {
    setEmployeeToEdit(employee)
    setEditForm({
      fullName: `${employee.first_name} ${employee.last_name}`,
      phone: employee.phone,
      role: employee.role
    })
    setEditDialogOpen(true)
  }

  async function confirmEditEmployee() {
    if (!employeeToEdit) return

    if (!editForm.fullName.trim() || !editForm.phone.trim() || !editForm.role.trim()) {
      toast.warning('Missing Fields', 'Please fill in all required fields')
      return
    }

    const nameParts = editForm.fullName.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || firstName

    try {
      await updateEmployee(employeeToEdit.id, {
        first_name: firstName,
        last_name: lastName,
        phone: editForm.phone,
        role: editForm.role
      })

      toast.success('Employee Updated', 'Employee details have been updated successfully')
      await loadEmployees()
      setEditDialogOpen(false)
      setEmployeeToEdit(null)
    } catch (error) {
      console.error('Error updating employee:', error)
      toast.error('Failed to update employee', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  function handleDeleteEmployee(id: string) {
    setEmployeeToDelete(id)
    setDeleteDialogOpen(true)
  }

  async function confirmDeleteEmployee() {
    if (!employeeToDelete) return

    try {
      await deleteEmployee(employeeToDelete)
      toast.success('Employee Deleted', 'The employee has been deleted successfully')
      await loadEmployees()
    } catch (error) {
      console.error('Error deleting employee:', error)
      toast.error('Failed to delete employee', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setDeleteDialogOpen(false)
      setEmployeeToDelete(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Employees</h1>
            <p className="text-muted-foreground">Manage your contractual employees</p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Temp Employee
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Contractual employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temp Paid Salary</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-blue-600">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(tempPaidSalary)}</div>
              <p className="text-xs text-muted-foreground">Total salary paid</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Salary Total</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-orange-600">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(dueSalaryTotal)}</div>
              <p className="text-xs text-muted-foreground">Outstanding balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Contractual Employees</CardTitle>
            <CardDescription>Search and manage your temp employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Employees Table */}
        {loading ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Loading employees...</p>
            </CardContent>
          </Card>
        ) : contractualEmployees.length > 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Name</th>
                      <th className="text-left p-2 font-medium">Phone</th>
                      <th className="text-left p-2 font-medium">Job Role</th>
                      <th className="text-left p-2 font-medium">Total Earned</th>
                      <th className="text-left p-2 font-medium">Total Paid</th>
                      <th className="text-left p-2 font-medium">Balance</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractualEmployees.map((employee) => (
                      <tr key={employee.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">
                          <button
                            onClick={() => router.push(`/employees/${employee.id}`)}
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {employee.first_name} {employee.last_name}
                          </button>
                        </td>
                        <td className="p-2 text-sm">{employee.phone}</td>
                        <td className="p-2 text-sm capitalize">{employee.role}</td>
                        <td className="p-2 font-medium">{formatCurrency(employee.total_earned || 0)}</td>
                        <td className="p-2 font-medium text-red-600">{formatCurrency(employee.advance_paid || 0)}</td>
                        <td className="p-2 font-medium text-green-600">{formatCurrency(employee.balance || 0)}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditEmployee(employee)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No employees found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first temp employee'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowAddForm(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Temp Employee
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>👤 Add New Employee</DialogTitle>
            <DialogDescription>
              Add a new contractual (temp) employee
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name *</label>
              <input
                type="text"
                value={addForm.fullName}
                onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="Enter employee name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone *</label>
              <input
                type="text"
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="Enter phone number"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Role *</label>
              <input
                type="text"
                value={addForm.role}
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                placeholder="Enter job role"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false)
                setAddForm({ fullName: '', phone: '', role: '' })
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddEmployee}>
              Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name *</label>
              <input
                type="text"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone *</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Role *</label>
              <input
                type="text"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false)
                setEmployeeToEdit(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmEditEmployee}>
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
              Delete Employee
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setEmployeeToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteEmployee}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </DashboardLayout>
  )
}
