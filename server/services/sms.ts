import axios from 'axios';

const SMS_TO_API_URL = 'https://api.sms.to/sms/send';

export async function initializeSMSService(): Promise<boolean> {
  const apiKey = process.env.SMS_TO_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ SMS.to API key not configured. SMS service disabled.');
    console.warn('Set SMS_TO_API_KEY in .env to enable SMS.');
    return false;
  }

  console.log('✅ SMS service initialized with SMS.to');
  return true;
}

export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  const apiKey = process.env.SMS_TO_API_KEY;

  if (!apiKey) {
    console.warn('SMS service not initialized');
    return false;
  }

  try {
    // Normalize phone number for Congo (CG)
    // Expected format: +242... or 06... or 05...
    let normalizedNumber = phoneNumber.trim();
    
    // Remove spaces and dashes
    normalizedNumber = normalizedNumber.replace(/[\s-]/g, '');
    
    // Add country code if not present
    if (!normalizedNumber.startsWith('+')) {
      if (normalizedNumber.startsWith('0')) {
        // Replace leading 0 with +242
        normalizedNumber = '+242' + normalizedNumber.substring(1);
      } else {
        normalizedNumber = '+242' + normalizedNumber;
      }
    }

    const response = await axios.post(
      SMS_TO_API_URL,
      {
        to: normalizedNumber,
        message: message,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.success) {
      console.log(`✅ SMS sent to ${normalizedNumber}`);
      return true;
    } else {
      console.error('❌ SMS send failed:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to send SMS:', error);
    return false;
  }
}

export function generatePasswordResetSMSMessage(resetCode: string): string {
  return `Géant Casino: Votre code de réinitialisation est ${resetCode}. Valide 1h. Ne le partagez pas.`;
}

export function generateTwoFactorSMSMessage(code: string): string {
  return `Géant Casino: Votre code de vérification est ${code}. Valide 10min. Ne le partagez pas.`;
}

export function generateOrderConfirmationSMSMessage(orderNumber: string, pickupCode: string): string {
  return `Géant Casino: Commande ${orderNumber} confirmée. Code retrait: ${pickupCode}. À bientôt!`;
}
