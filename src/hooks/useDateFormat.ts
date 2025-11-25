'use client'

import { useSettings } from '@/contexts/SettingsContext'
import { formatDate as formatDateUtil } from '@/lib/utils'

/**
 * Hook that provides date formatting using app settings
 */
export function useDateFormat() {
  const { settings } = useSettings()

  const formatDate = (date: Date | string, format?: 'short' | 'medium' | 'long' | 'relative') => {
    // If a specific format is requested, use it
    if (format) {
      return formatDateUtil(date, format, settings.locale)
    }
    // Otherwise use the date format from settings
    return formatDateUtil(date, settings.dateFormat, settings.locale)
  }

  return { 
    formatDate, 
    dateFormat: settings.dateFormat, 
    locale: settings.locale 
  }
}
