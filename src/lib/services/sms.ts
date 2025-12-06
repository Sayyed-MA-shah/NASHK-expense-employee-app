// SMS Service with Twilio Integration
// Supports global SMS delivery with test mode

interface SMSConfig {
  enabled: boolean
  testMode: boolean
  twilioAccountSid?: string
  twilioAuthToken?: string
  twilioPhoneNumber?: string
}

interface SMSMessage {
  to: string
  message: string
  type: 'salary_payment' | 'work_assignment' | 'advance_payment' | 'custom'
}

interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
  testMode: boolean
}

class SMSService {
  private config: SMSConfig

  constructor() {
    this.config = {
      enabled: false,
      testMode: true,
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
      twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
      twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
    }
  }

  async sendSMS(message: SMSMessage): Promise<SMSResult> {
    // Check if SMS is enabled
    if (!this.config.enabled) {
      console.log('SMS disabled. Message not sent:', message)
      return {
        success: true,
        testMode: true,
        error: 'SMS service is disabled'
      }
    }

    // Test mode - simulate sending without actual API call
    if (this.config.testMode) {
      console.log('📱 TEST MODE - SMS would be sent:', {
        to: message.to,
        message: message.message,
        type: message.type
      })
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return {
        success: true,
        messageId: `test_${Date.now()}`,
        testMode: true
      }
    }

    // Validate configuration
    if (!this.config.twilioAccountSid || !this.config.twilioAuthToken || !this.config.twilioPhoneNumber) {
      return {
        success: false,
        error: 'Twilio configuration is incomplete',
        testMode: false
      }
    }

    // Validate phone number format
    const phoneNumber = this.formatPhoneNumber(message.to)
    if (!phoneNumber) {
      return {
        success: false,
        error: 'Invalid phone number format',
        testMode: false
      }
    }

    try {
      // Send actual SMS via Twilio
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.config.twilioAccountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(
              `${this.config.twilioAccountSid}:${this.config.twilioAuthToken}`
            ).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: phoneNumber,
            From: this.config.twilioPhoneNumber!,
            Body: message.message,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send SMS')
      }

      const data = await response.json()
      
      return {
        success: true,
        messageId: data.sid,
        testMode: false
      }
    } catch (error) {
      console.error('SMS sending error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        testMode: false
      }
    }
  }

  // Format phone number to E.164 format (international standard)
  private formatPhoneNumber(phone: string): string | null {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // If already has country code (starts with +)
    if (phone.startsWith('+')) {
      return phone.replace(/\s/g, '')
    }
    
    // If starts with 00 (international prefix)
    if (cleaned.startsWith('00')) {
      return '+' + cleaned.substring(2)
    }
    
    // If doesn't start with country code, assume it needs one
    // For Pakistan, add +92
    if (cleaned.startsWith('0')) {
      return '+92' + cleaned.substring(1)
    }
    
    // If already formatted correctly
    if (cleaned.length >= 10) {
      return '+' + cleaned
    }
    
    return null
  }

  // Update configuration
  updateConfig(config: Partial<SMSConfig>) {
    this.config = { ...this.config, ...config }
  }

  // Get current configuration
  getConfig(): SMSConfig {
    return { ...this.config }
  }

  // SMS Templates
  templates = {
    salaryPayment: (employeeName: string, amount: string, date: string) => 
      `Hello ${employeeName}, your salary payment of ${amount} has been processed on ${date}. Thank you! - NASHAK Portal`,
    
    workAssignment: (employeeName: string, workDescription: string, date: string) =>
      `Hello ${employeeName}, new work assigned: ${workDescription} on ${date}. - NASHAK Portal`,
    
    advancePayment: (employeeName: string, amount: string, date: string) =>
      `Hello ${employeeName}, advance payment of ${amount} has been approved on ${date}. - NASHAK Portal`,
    
    overtimeApproved: (employeeName: string, hours: string, date: string) =>
      `Hello ${employeeName}, overtime of ${hours} hours has been approved for ${date}. - NASHAK Portal`,
  }
}

// Export singleton instance
export const smsService = new SMSService()

// Export types
export type { SMSConfig, SMSMessage, SMSResult }
