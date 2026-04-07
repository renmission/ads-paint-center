const BASE_URL =
  process.env.IPROGSMS_BASE_URL ?? "https://iprogsms.com/api";

/**
 * Send an SMS via the iPROGSMS API.
 * Fails silently so a messaging error never blocks a core operation.
 */
export async function sendSMS(phone: string, message: string): Promise<void> {
  const apiKey = process.env.IPROGSMS_API_KEY;
  if (!apiKey) {
    console.warn("[SMS] IPROGSMS_API_KEY is not configured — skipping.");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apikey: apiKey, to: phone, message }),
    });
    if (!res.ok) {
      console.error(
        `[SMS] Failed to send to ${phone}: HTTP ${res.status} — ${await res.text()}`
      );
    }
  } catch (err) {
    console.error("[SMS] Network error:", err);
  }
}
