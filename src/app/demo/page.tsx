'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, FileText, Calculator, Clock, DollarSign, TrendingUp } from 'lucide-react'
import { mockEmployees } from '@/lib/mockData'

export default function DemoPage() {
  const contractualEmployees = mockEmployees.filter(emp => emp.type === 'contractual')
  const fixedEmployees = mockEmployees.filter(emp => emp.type === 'fixed')

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Employee Reports Demo</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comprehensive employee management system with detailed reporting for both contractual and fixed salary employees. 
          Features include work record tracking, salary payments, overtime management, and professional print layouts.
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-center">
            <FileText className="w-8 h-8 mx-auto text-blue-600" />
            <CardTitle>Detailed Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Comprehensive employee reports with work records, payments, and balance tracking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Calculator className="w-8 h-8 mx-auto text-green-600" />
            <CardTitle>Automatic Calculations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Real-time calculation of earnings, payments, balances, and overtime compensation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Clock className="w-8 h-8 mx-auto text-purple-600" />
            <CardTitle>Date Filtering</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Filter data by date ranges to view specific periods and generate targeted reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <DollarSign className="w-8 h-8 mx-auto text-yellow-600" />
            <CardTitle>Payment Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Track salary payments, advances, and outstanding balances with detailed history
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-red-600" />
            <CardTitle>Overtime Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Manage overtime records for fixed employees with flexible rates and descriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Users className="w-8 h-8 mx-auto text-indigo-600" />
            <CardTitle>Print Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Professional print layouts optimized for payslips and official documentation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contractual Employees Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Contractual Employees
          </h2>
          <Badge variant="secondary">{contractualEmployees.length} employees</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contractualEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{employee.firstName} {employee.lastName}</CardTitle>
                <CardDescription>
                  <Badge variant="outline" className="capitalize">{employee.role}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Earned:</span>
                    <span className="font-medium">${employee.totalEarned?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Advance Paid:</span>
                    <span className="font-medium">${employee.advancePaid?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className={`font-medium ${(employee.balance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${employee.balance?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Work Records:</span>
                    <span className="font-medium">{employee.workRecords?.length || 0}</span>
                  </div>
                </div>
                
                <Button asChild className="w-full">
                  <Link href={`/employees/${employee.id}/report`}>
                    View Report
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Fixed Salary Employees Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Fixed Salary Employees
          </h2>
          <Badge variant="secondary">{fixedEmployees.length} employees</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fixedEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{employee.firstName} {employee.lastName}</CardTitle>
                <CardDescription>
                  <Badge variant="outline" className="capitalize">{employee.role}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Salary:</span>
                    <span className="font-medium">${employee.monthlySalary?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid Amount:</span>
                    <span className="font-medium">${employee.paidAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className={`font-medium ${(employee.balance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${employee.balance?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overtime Records:</span>
                    <span className="font-medium">{employee.overtimeRecords?.length || 0}</span>
                  </div>
                </div>
                
                <Button asChild className="w-full">
                  <Link href={`/employees/fixed/${employee.id}/report`}>
                    View Report
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Demo Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Demo Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-blue-800">
          <p><strong>Contractual Employee Reports:</strong> Click on any contractual employee to view their detailed report with work records, salary payments, and advance tracking.</p>
          <p><strong>Fixed Salary Employee Reports:</strong> Click on any fixed salary employee to view their monthly salary, overtime records, and total compensation.</p>
          <p><strong>Features to Test:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Add new work records or overtime entries</li>
            <li>Record salary payments and advances</li>
            <li>Filter data by date ranges</li>
            <li>Print reports using the browser's print function</li>
            <li>Edit or delete existing records</li>
            <li>View automatic balance calculations</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-center gap-4 pt-6">
        <Button asChild variant="outline">
          <Link href="/employees">
            View All Employees
          </Link>
        </Button>
        <Button asChild>
          <Link href="/">
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}