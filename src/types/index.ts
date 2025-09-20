import React from 'react';

// ============ COMMON TYPES ============
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  message?: string;
  success: boolean;
}

// ============ PAYMENT TYPES ============
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type PaymentType = 'credit' | 'debit' | 'transfer' | 'refund';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'digital_wallet';

export interface Payment extends BaseEntity {
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: PaymentType;
  method: PaymentMethod;
  description: string;
  reference: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  merchantId?: string;
  merchantName?: string;
  transactionFee?: number;
  netAmount?: number;
  metadata?: Record<string, any>;
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
  failedAmount: number;
  avgTransactionValue: number;
  dailyChange: number;
  weeklyChange: number;
  monthlyChange: number;
}

// ============ EXPENSE TYPES ============
export type ExpenseCategory = 
  | 'setup_purchase' 
  | 'rent_bill_guest' 
  | 'material' 
  | 'logistic' 
  | 'outsource';

export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';

export interface Expense extends BaseEntity {
  amount: number;
  currency: string;
  category: ExpenseCategory;
  status: ExpenseStatus;
  description: string;
  date: Date;
  employeeId: string;
  employeeName: string;
  receipt?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface ExpenseStats {
  totalExpenses: number;
  totalAmount: number;
  pendingAmount: number;
  approvedAmount: number;
  rejectedAmount: number;
  avgExpenseValue: number;
  expensesByCategory: Record<ExpenseCategory, number>;
  monthlyTrend: Array<{ month: string; amount: number; count: number }>;
}

// ============ EMPLOYEE TYPES ============
export type EmployeeType = 'contractual' | 'fixed';
export type EmployeeRole = 'admin' | 'manager' | 'employee' | 'contractor' | 'intern' | 'developer' | 'designer' | 'accountant' | 'hr' | 'sales';
export type EmployeeStatus = 'active' | 'inactive' | 'suspended' | 'terminated';

export interface BaseEmployee extends BaseEntity {
  firstName: string;
  lastName: string;
  phone: string;
  role: EmployeeRole;
  type: EmployeeType;
  status: EmployeeStatus;
  hireDate: Date;
  terminationDate?: Date;
  avatar?: string;
  notes?: string;
}

export interface ContractualEmployee extends BaseEmployee {
  type: 'contractual';
  totalEarned: number;
  advancePaid: number;
  balance: number;
  workRecords: WorkRecord[];
  salaryPayments: SalaryPayment[];
  advances: AdvancePayment[];
}

export interface FixedEmployee extends BaseEmployee {
  type: 'fixed';
  monthlySalary: number;
  paidAmount: number;
  balance: number;
  salaryPayments: FixedSalaryPayment[];
  overtimeRecords: OvertimeRecord[];
}

export type Employee = ContractualEmployee | FixedEmployee;

export interface WorkRecord extends BaseEntity {
  employeeId: string;
  date: Date;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OvertimeRecord extends BaseEntity {
  employeeId: string;
  date: Date;
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

export interface SalaryPayment extends BaseEntity {
  employeeId: string;
  amount: number;
  paymentDate: Date;
  workRecordIds: string[];
  isAdvanceDeduction: boolean;
  type?: string; // payment type (e.g., 'salary', 'bonus', 'advance')
  notes?: string;
}

export interface AdvancePayment extends BaseEntity {
  employeeId: string;
  amount: number;
  paymentDate: Date;
  reason: string;
  notes?: string;
}

export interface FixedSalaryPayment extends BaseEntity {
  employeeId: string;
  amount: number;
  paymentDate: Date;
  month: string; // e.g., "2024-01"
  type?: string; // payment type (e.g., 'salary', 'bonus', 'advance')
  notes?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  contractualEmployees: number;
  fixedEmployees: number;
  totalContractualEarned: number;
  totalFixedSalaries: number;
  totalAdvancesPaid: number;
  employeesByRole: Record<EmployeeRole, number>;
  avgContractualEarning: number;
  avgFixedSalary: number;
}

export interface EmployeeActivity {
  id: string;
  employeeId: string;
  action: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ============ SETTINGS TYPES ============
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  paymentAlerts: boolean;
  expenseAlerts: boolean;
  employeeAlerts: boolean;
  systemAlerts: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'team';
  dataSharing: boolean;
  analyticsTracking: boolean;
  marketingEmails: boolean;
}

export interface SystemSettings {
  companyName: string;
  companyLogo?: string;
  defaultCurrency: string;
  defaultTimezone: string;
  fiscalYearStart: string;
  taxRate: number;
  features: FeatureSettings;
  integrations: IntegrationSettings;
  security: SecuritySettings;
}

export interface FeatureSettings {
  paymentsModule: boolean;
  expensesModule: boolean;
  employeesModule: boolean;
  reportsModule: boolean;
  apiAccess: boolean;
  multiCurrency: boolean;
  recurringPayments: boolean;
  bulkOperations: boolean;
}

export interface IntegrationSettings {
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  slackEnabled: boolean;
  googleWorkspaceEnabled: boolean;
  quickbooksEnabled: boolean;
  webhookUrl?: string;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordPolicy: PasswordPolicy;
  ipWhitelisting: boolean;
  auditLogging: boolean;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expirationDays: number;
}

// ============ EMPLOYEE REPORT TYPES ============
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface ContractualEmployeeReport {
  employee: ContractualEmployee;
  dateRange: DateRange;
  workRecords: WorkRecord[];
  salaryPayments: SalaryPayment[];
  totalEarned: number;
  totalPaid: number;
  balance: number;
}

export interface FixedEmployeeReport {
  employee: FixedEmployee;
  dateRange: DateRange;
  overtimeRecords: OvertimeRecord[];
  salaryPayments: FixedSalaryPayment[];
  monthlySalary: number;
  totalOvertime: number;
  totalCompensation: number;
  totalPaid: number;
  balance: number;
}

export interface ReportSummary {
  earned: number;
  paid: number;
  balance: number;
  overdueAmount?: number;
  isNegativeBalance: boolean;
}

// ============ DASHBOARD TYPES ============
export interface DashboardStats {
  payments: PaymentStats;
  expenses: ExpenseStats;
  employees: EmployeeStats;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface Widget {
  id: string;
  title: string;
  type: 'stat' | 'chart' | 'table' | 'custom';
  size: 'small' | 'medium' | 'large';
  data: any;
  position: { x: number; y: number };
}

// ============ NAVIGATION TYPES ============
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  badge?: string | number;
  disabled?: boolean;
}

export interface Breadcrumb {
  label: string;
  href?: string;
}

// ============ FORM TYPES ============
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox' | 'file';
  placeholder?: string;
  required?: boolean;
  validation?: Record<string, any>;
  options?: Array<{ label: string; value: string }>;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============ UI TYPES ============
export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface ActionButton {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  disabled?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// ============ API TYPES ============
export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, any>;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface BulkOperation {
  action: 'delete' | 'update' | 'export';
  ids: string[];
  data?: Record<string, any>;
}