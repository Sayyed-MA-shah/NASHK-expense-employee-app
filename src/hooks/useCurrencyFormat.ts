'use client'

import { useSettings } from '@/contexts/SettingsContext'
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils'

/**
 * Hook that provides currency formatting using app settings
 */
export function useCurrencyFormat() {
  const { settings } = useSettings()

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, settings.currency, settings.locale)
  }

  return { formatCurrency, currency: settings.currency, locale: settings.locale }
}
