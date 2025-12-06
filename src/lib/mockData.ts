import { 
  Payment, 
  Expense, 
  Employee, 
  ContractualEmployee,
  FixedEmployee,
  EmployeeType,
  EmployeeRole,
  EmployeeStatus,
  PaymentStats, 
  ExpenseStats, 
  EmployeeStats,
  DashboardStats,
  UserSettings,
  SystemSettings,
  EmployeeActivity
} from '@/types'
import { generateId } from './utils'

// ============ PAYMENT MOCK DATA ============
export const mockPayments: Payment[] = []

export const mockPaymentStats: PaymentStats = {
  totalPayments: 0,
  totalAmount: 0,
  pendingAmount: 0,
  completedAmount: 0,
  failedAmount: 0,
  avgTransactionValue: 0,
  dailyChange: 0,
  weeklyChange: 0,
  monthlyChange: 0,
}

// ============ EXPENSE MOCK DATA ============
export const mockExpenses: Expense[] = []

export const mockExpenseStats: ExpenseStats = {
  totalExpenses: 0,
  totalAmount: 0,
  pendingAmount: 0,
  approvedAmount: 0,
  rejectedAmount: 0,
  avgExpenseValue: 0,
  expensesByCategory: {
    setup_purchase: 0,
    rent_bill_guest: 0,
    material: 0,
    logistic: 0,
    outsource: 0,
  },
  monthlyTrend: [],
}

// ============ EMPLOYEE MOCK DATA ============
export const mockEmployees: Employee[] = []

export const mockEmployeeStats: EmployeeStats = {
  totalEmployees: 0,
  activeEmployees: 0,
  inactiveEmployees: 0,
  contractualEmployees: 0,
  fixedEmployees: 0,
  totalContractualEarned: 0,
  totalFixedSalaries: 0,
  totalAdvancesPaid: 0,
  employeesByRole: {
    admin: 0,
    manager: 0,
    employee: 0,
    contractor: 0,
    intern: 0,
    developer: 0,
    designer: 0,
    accountant: 0,
    hr: 0,
    sales: 0,
  },
  avgContractualEarning: 0,
  avgFixedSalary: 0,
}

export const mockEmployeeActivities: EmployeeActivity[] = []

// ============ SETTINGS MOCK DATA ============
export const mockUserSettings: UserSettings = {
  theme: 'system',
  language: 'en-US',
  timezone: 'America/New_York',
  dateFormat: 'MM/dd/yyyy',
  timeFormat: '12h',
  currency: 'USD',
  notifications: {
    email: true,
    push: true,
    sms: false,
    paymentAlerts: true,
    expenseAlerts: true,
    employeeAlerts: false,
    systemAlerts: true,
    weeklyReport: true,
    monthlyReport: true,
  },
  privacy: {
    profileVisibility: 'team',
    dataSharing: false,
    analyticsTracking: true,
    marketingEmails: false,
  },
}

export const mockSystemSettings: SystemSettings = {
  companyName: 'NASHAK SP Solutions',
  companyLogo: '/logo.png',
  defaultCurrency: 'USD',
  defaultTimezone: 'America/New_York',
  fiscalYearStart: 'January',
  taxRate: 8.5,
  features: {
    paymentsModule: true,
    expensesModule: true,
    employeesModule: true,
    reportsModule: true,
    apiAccess: false,
    multiCurrency: false,
    recurringPayments: true,
    bulkOperations: true,
  },
  integrations: {
    stripeEnabled: true,
    paypalEnabled: false,
    slackEnabled: true,
    googleWorkspaceEnabled: false,
    quickbooksEnabled: false,
    webhookUrl: 'https://api.company.com/webhooks',
  },
  security: {
    twoFactorAuth: true,
    sessionTimeout: 480, // 8 hours in minutes
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expirationDays: 90,
    },
    ipWhitelisting: false,
    auditLogging: true,
  },
}

// ============ DASHBOARD STATS ============
export const mockDashboardStats: DashboardStats = {
  payments: mockPaymentStats,
  expenses: mockExpenseStats,
  employees: mockEmployeeStats,
}

// ============ UTILITY FUNCTIONS ============
export function generateMockPayment(overrides?: Partial<Payment>): Payment {
  return {
    id: generateId(),
    amount: Math.floor(Math.random() * 5000) + 100,
    currency: 'USD',
    status: ['pending', 'completed', 'failed'][Math.floor(Math.random() * 3)] as Payment['status'],
    type: ['credit', 'debit'][Math.floor(Math.random() * 2)] as Payment['type'],
    method: ['credit_card', 'bank_transfer', 'digital_wallet'][Math.floor(Math.random() * 3)] as Payment['method'],
    description: `Payment ${Math.random().toString(36).substring(7)}`,
    reference: `PAY-${new Date().getFullYear()}-${('0000' + Math.floor(Math.random() * 9999)).slice(-4)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function generateMockExpense(overrides?: Partial<Expense>): Expense {
  const categories: Expense['category'][] = ['setup_purchase', 'rent_bill_guest', 'material', 'logistic', 'outsource']
  return {
    id: generateId(),
    amount: Math.floor(Math.random() * 1000) + 10,
    currency: 'USD',
    category: categories[Math.floor(Math.random() * categories.length)],
    status: ['draft', 'submitted', 'approved', 'rejected'][Math.floor(Math.random() * 4)] as Expense['status'],
    description: `Expense ${Math.random().toString(36).substring(7)}`,
    date: new Date(),
    employeeId: `emp_${Math.floor(Math.random() * 100)}`,
    employeeName: `Employee ${Math.random().toString(36).substring(7)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function generateMockEmployee(overrides?: Partial<Employee>): Employee {
  const roles: EmployeeRole[] = ['employee', 'manager', 'developer', 'designer', 'contractor']
  const types: EmployeeType[] = ['contractual', 'fixed']
  const selectedType = types[Math.floor(Math.random() * types.length)]
  
  const baseEmployee = {
    id: generateId(),
    firstName: `FirstName${Math.random().toString(36).substring(7)}`,
    lastName: `LastName${Math.random().toString(36).substring(7)}`,
    phone: `+1-555-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    role: roles[Math.floor(Math.random() * roles.length)],
    type: selectedType,
    status: 'active' as EmployeeStatus,
    hireDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }

  if (selectedType === 'contractual') {
    return {
      ...baseEmployee,
      type: 'contractual',
      totalEarned: Math.floor(Math.random() * 5000),
      advancePaid: Math.floor(Math.random() * 500),
      balance: 0,
      workRecords: [],
      salaryPayments: [],
      advances: [],
    } as ContractualEmployee
  } else {
    return {
      ...baseEmployee,
      type: 'fixed',
      monthlySalary: Math.floor(Math.random() * 5000) + 3000,
      paidAmount: Math.floor(Math.random() * 4000),
      balance: 0,
      salaryPayments: [],
    } as FixedEmployee
  }
}