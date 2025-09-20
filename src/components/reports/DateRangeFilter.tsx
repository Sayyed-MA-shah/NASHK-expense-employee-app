'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, RefreshCw } from 'lucide-react'
import { DateRange } from '@/types'

interface DateRangeFilterProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  onReset: () => void
  actionButtons?: React.ReactNode
}

export default function DateRangeFilter({ 
  dateRange, 
  onDateRangeChange, 
  onReset,
  actionButtons
}: DateRangeFilterProps) {
  const handleStartDateChange = (date: string) => {
    onDateRangeChange({ ...dateRange, startDate: date })
  }

  const handleEndDateChange = (date: string) => {
    onDateRangeChange({ ...dateRange, endDate: date })
  }

  const hasDateFilter = dateRange.startDate || dateRange.endDate

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            Date Range Filter
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">From:</label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-auto"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">To:</label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-auto"
              />
            </div>

            {hasDateFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Reset
              </Button>
            )}
            
            {actionButtons && (
              <div className="flex gap-2 ml-auto">
                {actionButtons}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}