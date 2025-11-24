'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface AppSettings {
  currency: string
  locale: string
  theme: string
  language: string
  timeFormat: '12h' | '24h'
  dateFormat: string
  notifications: {
    email: boolean
    push: boolean
    paymentAlerts: boolean
    expenseAlerts: boolean
    weeklyReport: boolean
  }
}

const defaultSettings: AppSettings = {
  currency: 'PKR',
  locale: 'en-PK',
  theme: 'light',
  language: 'en-US',
  timeFormat: '24h',
  dateFormat: 'dd/MM/yyyy',
  notifications: {
    email: true,
    push: true,
    paymentAlerts: true,
    expenseAlerts: true,
    weeklyReport: true,
  },
}

interface SettingsContextType {
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('app-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('app-settings', JSON.stringify(settings))
    }
  }, [settings, isLoaded])

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      // Handle nested notifications object
      notifications: newSettings.notifications
        ? { ...prev.notifications, ...newSettings.notifications }
        : prev.notifications,
    }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('app-settings')
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
