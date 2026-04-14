const IPROGSMS_API_URL = "https://www.iprogsms.com/api/v1/sms_messages";

/**
 * Send an SMS via the iPROGSMS v1 API.
 * Fails silently so a messaging error never blocks a core operation.
 * Without IPROGSMS_API_TOKEN, logs a simulation message instead of sending.
 */
export async function sendSMS(phone: string, message: string): Promise<void> {
  const token = process.env.IPROGSMS_API_TOKEN;

  if (!token) {
    console.log("[SMS] No API token — simulating send:", {
      to: phone,
      message,
    });
    return;
  }

  try {
    const res = await fetch(`${IPROGSMS_API_URL}?api_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number: phone, message }),
    });

    if (!res.ok) {
      console.error(`[SMS] HTTP ${res.status}:`, await res.text());
      return;
    }

    const data = (await res.json()) as {
      status: string;
      message: string;
      message_id?: string | number;
    };

    if (!data.message_id) {
      console.error("[SMS] Rejected by API:", data.message);
      return;
    }

    console.log(`[SMS] Sent — id: ${data.message_id}`);
  } catch (err) {
    console.error("[SMS] Network error:", err);
  }
}
