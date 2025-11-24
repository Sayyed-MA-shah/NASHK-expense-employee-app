import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ExpenseCategory, EmployeeType, EmployeeRole, Employee, ContractualEmployee, FixedEmployee } from '@/types'
import { 
  ShoppingCart, 
  Home, 
  Package, 
  Truck, 
  Users,
  UserCheck,
  UserCog,
  Clock,
  DollarSign,
  LucideIcon
} from 'lucide-react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Expense category icon mapping
export function getExpenseCategoryIcon(category: ExpenseCategory): LucideIcon {
  const iconMap: Record<ExpenseCategory, LucideIcon> = {
    setup_purchase: ShoppingCart,
    rent_bill_guest: Home,
    material: Package,
    logistic: Truck,
    outsource: Users,
  }
  
  return iconMap[category]
}

// Expense category display names
export function getExpenseCategoryName(category: ExpenseCategory): string {
  const nameMap: Record<ExpenseCategory, string> = {
    setup_purchase: 'Setup Purchase',
    rent_bill_guest: 'Rent/Bill/Guest',
    material: 'Material',
    logistic: 'Logistic',
    outsource: 'Outsource',
  }
  
  return nameMap[category]
}

// Expense category colors
export function getExpenseCategoryColor(category: ExpenseCategory): string {
  const colorMap: Record<ExpenseCategory, string> = {
    setup_purchase: 'text-blue-600 bg-blue-100',
    rent_bill_guest: 'text-green-600 bg-green-100',
    material: 'text-purple-600 bg-purple-100',
    logistic: 'text-orange-600 bg-orange-100',
    outsource: 'text-indigo-600 bg-indigo-100',
  }
  
  return colorMap[category]
}

// Employee type icon mapping
export function getEmployeeTypeIcon(type: EmployeeType): LucideIcon {
  const iconMap: Record<EmployeeType, LucideIcon> = {
    contractual: Clock,
    fixed: UserCheck,
  }
  
  return iconMap[type]
}

// Employee type display names
export function getEmployeeTypeName(type: EmployeeType): string {
  const nameMap: Record<EmployeeType, string> = {
    contractual: 'Contractual/Temp',
    fixed: 'Fixed Salary',
  }
  
  return nameMap[type]
}

// Employee type colors
export function getEmployeeTypeColor(type: EmployeeType): string {
  const colorMap: Record<EmployeeType, string> = {
    contractual: 'text-orange-600 bg-orange-100',
    fixed: 'text-green-600 bg-green-100',
  }
  
  return colorMap[type]
}

// Employee role icon mapping
export function getEmployeeRoleIcon(role: EmployeeRole): LucideIcon {
  const iconMap: Record<EmployeeRole, LucideIcon> = {
    admin: UserCog,
    manager: Users,
    employee: UserCheck,
    contractor: Clock,
    intern: UserCheck,
    developer: UserCheck,
    designer: UserCheck,
    accountant: DollarSign,
    hr: Users,
    sales: UserCheck,
  }
  
  return iconMap[role]
}

// Calculate contractual employee balance
export function calculateContractualBalance(employee: ContractualEmployee): number {
  return employee.totalEarned - employee.advancePaid
}

// Calculate fixed employee balance  
export function calculateFixedBalance(employee: FixedEmployee): number {
  return employee.monthlySalary - employee.paidAmount
}

// Get employee full name
export function getEmployeeFullName(employee: Employee): string {
  return `${employee.firstName} ${employee.lastName}`
}

export function formatCurrency(
  amount: number,
  currency?: string,
  locale?: string
): string {
  // Use provided values or defaults
  const currencyCode = currency || 'PKR'
  const localeCode = locale || 'en-PK'
  
  return new Intl.NumberFormat(localeCode, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount)
}

// Currency symbols map for quick display
export const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  PKR: 'Rs',
  INR: '₹',
  AED: 'د.إ',
  SAR: 'ر.س',
}

export function getCurrencySymbol(currency: string): string {
  return currencySymbols[currency] || currency
}

export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' | 'relative' = 'medium',
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (format === 'relative') {
    return formatRelativeTime(dateObj)
  }

  const options: any = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' },
    long: { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }
  }[format]

  return new Intl.DateTimeFormat(locale, options).format(dateObj)
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

export function formatNumber(
  number: number,
  compact: boolean = false,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: 2,
  }).format(number)
}

export function formatPercent(
  value: number,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: any
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    active: 'text-green-600 bg-green-50',
    inactive: 'text-gray-600 bg-gray-50',
    pending: 'text-yellow-600 bg-yellow-50',
    completed: 'text-green-600 bg-green-50',
    failed: 'text-red-600 bg-red-50',
    cancelled: 'text-gray-600 bg-gray-50',
    approved: 'text-green-600 bg-green-50',
    rejected: 'text-red-600 bg-red-50',
    draft: 'text-gray-600 bg-gray-50',
    submitted: 'text-blue-600 bg-blue-50',
    processing: 'text-blue-600 bg-blue-50',
  }
  return statusColors[status.toLowerCase()] || 'text-gray-600 bg-gray-50'
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = (item[key] as unknown as string) || 'other'
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

export function filterBy<T>(
  array: T[],
  filters: Record<string, any>
): T[] {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === '') return true
      
      const itemValue = (item as any)[key]
      if (typeof value === 'string' && typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase())
      }
      return itemValue === value
    })
  })
}

export function downloadAsCSV(data: any[], filename: string): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}