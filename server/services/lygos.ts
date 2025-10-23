import axios from "axios";
import crypto from "crypto";

const baseUrl = process.env.LYGOS_BASE_URL || "";
const apiKey = process.env.LYGOS_API_KEY || "";
const merchantId = process.env.LYGOS_MERCHANT_ID || "";

export async function lygosInitiateMomoPayment(params: {
  orderId: string;
  amount: number;
  currency: string;
  customerPhone: string;
}): Promise<{ paymentUrl?: string; transactionId?: string; provider: string }> {
  const url = `${baseUrl}/v1/transactions`;
  const payload = {
    merchantId,
    reference: params.orderId,
    amount: params.amount,
    currency: params.currency,
    channel: "mtn_momo_cg",
    payer: {
      phone: params.customerPhone,
    },
    metadata: {
      orderId: params.orderId,
    },
  } as any;
  const headers = { Authorization: `Bearer ${apiKey}` } as any;
  const res = await axios.post(url, payload, { headers, timeout: 15000 });
  const data = res.data || {};
  return {
    paymentUrl: data.checkoutUrl || data.paymentUrl,
    transactionId: data.transactionId || data.id,
    provider: "MTN Mobile Money",
  };
}

export function verifyLygosSignature(rawBody: string, signature: string | undefined): boolean {
  const secret = process.env.LYGOS_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const provided = signature.startsWith("sha256=") ? signature.slice(7) : signature;
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(provided, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
