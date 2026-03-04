// ─── iPROGSMS Client ─────────────────────────────────────────
// Student account: API key only, no sender name required.
// ─────────────────────────────────────────────────────────────

import axios from 'axios';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { smsLogs } from '@/lib/db/schema';

export interface SmsResult {
  success: boolean;
  providerRef?: string;
  error?: string;
}

/**
 * Send an SMS via iPROGSMS.
 * @param phone   Recipient phone number (e.g. "09XXXXXXXXX" or "+639XXXXXXXXX")
 * @param message SMS message body
 * @param options Optional: link to customer/order for logging
 */
export async function sendSms(
  phone: string,
  message: string,
  options?: {
    customerId?: number;
    orderId?: number;
  },
): Promise<SmsResult> {
  const apiKey = process.env.IPROGSMS_API_KEY;
  const baseUrl = process.env.IPROGSMS_BASE_URL ?? 'https://iprogsms.com/api';

  if (!apiKey) {
    console.error('[SMS] IPROGSMS_API_KEY is not set');
    return { success: false, error: 'SMS API key not configured' };
  }

  // Log as pending first
  const [logEntry] = await db
    .insert(smsLogs)
    .values({
      customerId: options?.customerId ?? null,
      orderId: options?.orderId ?? null,
      recipientPhone: phone,
      message,
      status: 'pending',
    })
    .returning();

  try {
    // iPROGSMS API call — student account: no sendername field
    const response = await axios.post(
      `${baseUrl}/send`,
      {
        api_key: apiKey,
        number: phone,
        message,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      },
    );

    const providerRef = String(response.data?.message_id ?? response.data?.id ?? '');

    // Update log to sent
    await db
      .update(smsLogs)
      .set({ status: 'sent', providerRef, sentAt: new Date() })
      .where(eq(smsLogs.id, logEntry.id));

    return { success: true, providerRef };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown SMS error';

    // Update log to failed
    await db
      .update(smsLogs)
      .set({ status: 'failed', errorMessage: error })
      .where(eq(smsLogs.id, logEntry.id));

    console.error('[SMS] Failed to send:', error);
    return { success: false, error };
  }
}

// ─── SMS Message Templates ────────────────────────────────────

export const smsTemplates = {
  orderConfirmed: (orderNumber: string, customerName: string) =>
    `Hi ${customerName}! Your order #${orderNumber} at ADS Paint Center has been confirmed. We will notify you when it is ready. Thank you!`,

  orderReady: (orderNumber: string, customerName: string) =>
    `Hi ${customerName}! Your order #${orderNumber} is ready for pickup at ADS Paint Center. Thank you for your patience!`,

  orderDelivered: (orderNumber: string) =>
    `Your order #${orderNumber} has been delivered. Thank you for choosing ADS Paint Center!`,

  paymentReceived: (orderNumber: string, amount: string) =>
    `Payment of PHP ${amount} received for order #${orderNumber}. Thank you! - ADS Paint Center`,
};
