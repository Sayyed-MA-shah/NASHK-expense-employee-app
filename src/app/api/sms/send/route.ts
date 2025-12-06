import { NextRequest, NextResponse } from 'next/server'
import { getSMSSettings, createSMSLog } from '@/lib/api/sms'

export async function POST(request: NextRequest) {
  try {
    const { phone, message, messageType } = await request.json()

    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    // Get SMS settings
    const settings = await getSMSSettings()

    if (!settings.enabled) {
      return NextResponse.json(
        { success: false, error: 'SMS service is disabled' },
        { status: 400 }
      )
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone)
    if (!formattedPhone) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    let result: any = {}

    // Check if test mode
    if (settings.test_mode) {
      console.log('📱 TEST MODE - SMS simulation:', {
        to: formattedPhone,
        message,
        type: messageType || 'test'
      })

      result = {
        success: true,
        messageId: `test_${Date.now()}`,
        testMode: true
      }

      // Log the test SMS
      await createSMSLog({
        phone_number: formattedPhone,
        message,
        message_type: messageType || 'test',
        status: 'sent',
        twilio_message_id: result.messageId,
        test_mode: true,
      })

      return NextResponse.json({
        success: true,
        testMode: true,
        message: 'Test SMS logged successfully (not actually sent)'
      })
    }

    // Validate Twilio configuration
    if (!settings.twilio_account_sid || !settings.twilio_auth_token || !settings.twilio_phone_number) {
      return NextResponse.json(
        { success: false, error: 'Twilio configuration is incomplete' },
        { status: 400 }
      )
    }

    // Send actual SMS via Twilio
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${settings.twilio_account_sid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(
              `${settings.twilio_account_sid}:${settings.twilio_auth_token}`
            ).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: formattedPhone,
            From: settings.twilio_phone_number,
            Body: message,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send SMS')
      }

      // Log successful SMS
      await createSMSLog({
        phone_number: formattedPhone,
        message,
        message_type: messageType || 'test',
        status: 'sent',
        twilio_message_id: data.sid,
        test_mode: false,
      })

      return NextResponse.json({
        success: true,
        messageId: data.sid,
        testMode: false,
        message: 'SMS sent successfully'
      })
    } catch (twilioError: any) {
      // Log failed SMS
      await createSMSLog({
        phone_number: formattedPhone,
        message,
        message_type: messageType || 'test',
        status: 'failed',
        error_message: twilioError.message,
        test_mode: false,
      })

      return NextResponse.json(
        { 
          success: false, 
          error: twilioError.message || 'Failed to send SMS',
          details: twilioError
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('SMS API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

function formatPhoneNumber(phone: string): string | null {
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
  
  // If starts with 0 (Pakistani local format), add +92
  if (cleaned.startsWith('0')) {
    return '+92' + cleaned.substring(1)
  }
  
  // If already formatted correctly (10+ digits)
  if (cleaned.length >= 10) {
    // Assume Pakistan if no country code
    if (cleaned.length === 10) {
      return '+92' + cleaned
    }
    return '+' + cleaned
  }
  
  return null
}
