'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ConfirmationDialog from '@/components/reports/ConfirmationDialog'
import { mockEmployees, mockEmployeeStats } from '@/lib/mockData'
import { 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  getEmployeeTypeIcon, 
  getEmployeeTypeName,
  getEmployeeTypeColor,
  getEmployeeRoleIcon,
  getEmployeeFullName,
  calculateContractualBalance,
  calculateFixedBalance
} from '@/lib/utils'
import { EmployeeType, ContractualEmployee, FixedEmployee, Employee, EmployeeRole } from '@/types'
import { 
  Plus, 
  Search, 
  Filter, 
  Users,
  Clock,
  DollarSign,
  X,
  Trash2,
  Printer,
  Download,
  UserPlus,
  Briefcase,
  CreditCard,
  Eye
} from 'lucide-react'

export default function EmployeesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<EmployeeType | 'all'>('all')
  const [filterRole, setFilterRole] = useState<EmployeeRole | 'all'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; employeeId: string; employeeName: string }>({
    isOpen: false,
    employeeId: '',
    employeeName: ''
  })

  // Filter employees based on search and filters
  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.phone.includes(searchTerm)
    const matchesType = filterType === 'all' || employee.type === filterType
    const matchesRole = filterRole === 'all' || employee.role === filterRole
    
    return matchesSearch && matchesType && matchesRole
  })

  const contractualEmployees = filteredEmployees.filter(emp => emp.type === 'contractual')
  const fixedEmployees = filteredEmployees.filter(emp => emp.type === 'fixed')

  const handleViewReport = (employee: Employee) => {
    if (employee.type === 'contractual') {
      router.push(`/employees/${employee.id}/report`)
    } else {
      router.push(`/employees/fixed/${employee.id}/report`)
    }
  }

  const handleDeleteEmployee = (employee: Employee) => {
    setDeleteDialog({
      isOpen: true,
      employeeId: employee.id,
      employeeName: getEmployeeFullName(employee)
    })
  }

  const confirmDeleteEmployee = () => {
    // In a real app, this would make an API call to delete the employee
    console.log(`Deleting employee with ID: ${deleteDialog.employeeId}`)
    // For now, just close the dialog
    setDeleteDialog({ isOpen: false, employeeId: '', employeeName: '' })
    // You could also update the local state to remove the employee from the list
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Employees</h1>
            <p className="text-muted-foreground">Manage your team members and their information</p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockEmployeeStats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                {mockEmployeeStats.activeEmployees} active, {mockEmployeeStats.inactiveEmployees} inactive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contractual</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockEmployeeStats.contractualEmployees}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {formatCurrency(mockEmployeeStats.avgContractualEarning)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fixed Salary</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockEmployeeStats.fixedEmployees}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {formatCurrency(mockEmployeeStats.avgFixedSalary)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Advances</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(mockEmployeeStats.totalAdvancesPaid)}</div>
              <p className="text-xs text-muted-foreground">Outstanding advances</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>Search and filter your employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
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

              {/* Type Filter */}
              <select
                className="px-3 py-2 border border-input rounded-md bg-background min-w-[140px]"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as EmployeeType | 'all')}
              >
                <option value="all">All Types</option>
                <option value="contractual">Contractual</option>
                <option value="fixed">Fixed Salary</option>
              </select>

              {/* Role Filter */}
              <select
                className="px-3 py-2 border border-input rounded-md bg-background min-w-[140px]"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as EmployeeRole | 'all')}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
                <option value="contractor">Contractor</option>
                <option value="intern">Intern</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="accountant">Accountant</option>
                <option value="hr">HR</option>
                <option value="sales">Sales</option>
              </select>

              {/* Clear Filters */}
              {(searchTerm || filterType !== 'all' || filterRole !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setFilterType('all')
                    setFilterRole('all')
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Employee Tables with Tabs */}
        <Tabs defaultValue="contractual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contractual" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Contractual ({contractualEmployees.length})
            </TabsTrigger>
            <TabsTrigger value="fixed" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Fixed Salary ({fixedEmployees.length})
            </TabsTrigger>
          </TabsList>

          {/* Contractual Employees Tab */}
          <TabsContent value="contractual">
            {contractualEmployees.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Contractual Employees
                  </CardTitle>
                  <CardDescription>
                    Employees working on hourly or project-based contracts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Employee</th>
                          <th className="text-left p-2">Contact</th>
                          <th className="text-left p-2">Role</th>
                          <th className="text-left p-2">Total Earned</th>
                          <th className="text-left p-2">Advance Paid</th>
                          <th className="text-left p-2">Balance</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contractualEmployees.map((employee) => (
                          <tr key={employee.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">
                              <div>
                                <div 
                                  className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                                  onClick={() => handleViewReport(employee)}
                                >
                                  {getEmployeeFullName(employee)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Hired: {formatDate(employee.hireDate)}
                                </div>
                              </div>
                            </td>
                            <td className="p-2 text-sm">{employee.phone}</td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const IconComponent = getEmployeeRoleIcon(employee.role)
                                  return <IconComponent className="w-4 h-4" />
                                })()}
                                <span className="capitalize">{employee.role}</span>
                              </div>
                            </td>
                            <td className="p-2 font-medium">{formatCurrency((employee as ContractualEmployee).totalEarned)}</td>
                            <td className="p-2 text-red-600">{formatCurrency((employee as ContractualEmployee).advancePaid)}</td>
                            <td className="p-2 font-medium text-green-600">{formatCurrency((employee as ContractualEmployee).balance)}</td>
                            <td className="p-2">
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEmployee(employee)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
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
                  <h3 className="text-lg font-semibold mb-2">No contractual employees found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterType !== 'all' || filterRole !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Get started by adding your first contractual employee'
                    }
                  </p>
                  {!searchTerm && filterType === 'all' && filterRole === 'all' && (
                    <Button onClick={() => setShowAddForm(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Contractual Employee
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Fixed Salary Employees Tab */}
          <TabsContent value="fixed">
            {fixedEmployees.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Fixed Salary Employees
                  </CardTitle>
                  <CardDescription>
                    Employees with monthly fixed compensation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Employee</th>
                          <th className="text-left p-2">Contact</th>
                          <th className="text-left p-2">Role</th>
                          <th className="text-left p-2">Monthly Salary</th>
                          <th className="text-left p-2">Paid Amount</th>
                          <th className="text-left p-2">Balance</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fixedEmployees.map((employee) => (
                          <tr key={employee.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">
                              <div>
                                <div 
                                  className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                                  onClick={() => handleViewReport(employee)}
                                >
                                  {getEmployeeFullName(employee)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Hired: {formatDate(employee.hireDate)}
                                </div>
                              </div>
                            </td>
                            <td className="p-2 text-sm">{employee.phone}</td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const IconComponent = getEmployeeRoleIcon(employee.role)
                                  return <IconComponent className="w-4 h-4" />
                                })()}
                                <span className="capitalize">{employee.role}</span>
                              </div>
                            </td>
                            <td className="p-2 font-medium">{formatCurrency((employee as FixedEmployee).monthlySalary)}</td>
                            <td className="p-2 text-green-600">{formatCurrency((employee as FixedEmployee).paidAmount)}</td>
                            <td className="p-2 font-medium text-orange-600">{formatCurrency((employee as FixedEmployee).balance)}</td>
                            <td className="p-2">
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEmployee(employee)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
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
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No fixed salary employees found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterType !== 'all' || filterRole !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Get started by adding your first fixed salary employee'
                    }
                  </p>
                  {!searchTerm && filterType === 'all' && filterRole === 'all' && (
                    <Button onClick={() => setShowAddForm(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Fixed Salary Employee
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Show combined no results if both filtered lists are empty */}
        {filteredEmployees.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No employees found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterType !== 'all' || filterRole !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first employee'
                }
              </p>
              {!searchTerm && filterType === 'all' && filterRole === 'all' && (
                <Button onClick={() => setShowAddForm(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, employeeId: '', employeeName: '' })}
        onConfirm={confirmDeleteEmployee}
        title="Delete Employee"
        description={`Are you sure you want to delete ${deleteDialog.employeeName}? This action cannot be undone and will remove all associated work records and payments.`}
        confirmText="Delete"
      />
    </DashboardLayout>
  )
}