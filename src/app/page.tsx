'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { getPayments, getExpenses } from '@/lib/api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPayin: 0,
    totalPayout: 0,
    totalExpenses: 0,
    balance: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  async function loadDashboardStats() {
    try {
      setLoading(true)
      // Fetch all payments and expenses
      const [payments, expenses] = await Promise.all([
        getPayments(),
        getExpenses()
      ])
      
      // Calculate PayIn (credit) and PayOut (debit)
      const totalPayin = payments
        .filter(p => p.type === 'credit')
        .reduce((sum, p) => sum + p.amount, 0)
      
      const totalPayout = payments
        .filter(p => p.type === 'debit')
        .reduce((sum, p) => sum + p.amount, 0)
      
      // Calculate total expenses
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
      
      // Balance = PayIn - PayOut - Expenses
      const balance = totalPayin - totalPayout - totalExpenses
      
      setStats({
        totalPayin,
        totalPayout,
        totalExpenses,
        balance,
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const recentTransactions = [
    { id: '1', description: 'Payment from client ABC', amount: 2500, type: 'credit' },
    { id: '2', description: 'Office supplies expense', amount: -150, type: 'debit' },
    { id: '3', description: 'Salary payment - John Doe', amount: -3000, type: 'debit' },
    { id: '4', description: 'Payment from client XYZ', amount: 1800, type: 'credit' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your business dashboard! Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total PayIn
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-green-600"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
              ) : (
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPayin)}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Total incoming payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total PayOut
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-red-600"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
              ) : (
                <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalPayout)}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Total outgoing payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
              ) : (
                <div className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</div>
              )}
              <p className="text-xs text-muted-foreground">
                All submitted expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Balance
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-blue-600"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
              ) : (
                <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(stats.balance)}</div>
              )}
              <p className="text-xs text-muted-foreground">
                PayIn - PayOut - Expenses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest financial activity in your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center space-x-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.type === 'credit' ? 'Income' : 'Expense'}
                      </p>
                    </div>
                    <div className={`font-medium ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Shortcuts to common tasks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors">
                  Add New Payment
                </button>
                <button className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors">
                  Record Expense
                </button>
                <button className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors">
                  Add Employee
                </button>
                <button className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors">
                  Generate Report
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}