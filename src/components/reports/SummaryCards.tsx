'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { ReportSummary } from '@/types'

interface SummaryCardsProps {
  summary: ReportSummary
  type: 'contractual' | 'fixed'
  monthlySalary?: number
}

export default function SummaryCards({ summary, type, monthlySalary }: SummaryCardsProps) {
  const cards = [
    {
      title: type === 'contractual' ? 'Total Earned' : 'Total Compensation',
      value: summary.earned,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Total Paid',
      value: summary.paid,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'Balance',
      value: summary.balance,
      icon: summary.isNegativeBalance ? AlertTriangle : CheckCircle,
      color: summary.isNegativeBalance ? 'text-red-600' : 'text-green-600',
      bgColor: summary.isNegativeBalance ? 'bg-red-50 dark:bg-red-950' : 'bg-green-50 dark:bg-green-950',
      description: summary.isNegativeBalance ? 'Advance Given' : 'Amount Due'
    }
  ]

  // Add monthly salary card for fixed employees
  if (type === 'fixed' && monthlySalary) {
    cards.unshift({
      title: 'Monthly Salary',
      value: monthlySalary,
      icon: Wallet,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={cn('p-2 rounded-md', card.bgColor)}>
              <card.icon className={cn('h-4 w-4', card.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn('text-2xl font-bold', card.color)}>
              {formatCurrency(Math.abs(card.value))}
              {card.value < 0 && ' (-)'}
            </div>
            {card.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}