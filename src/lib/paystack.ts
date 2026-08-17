import { env } from "./env";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function toSubunit(amount: number): number {
  return Math.round(amount * 100);
}

function fromSubunit(amount: number): number {
  return amount / 100;
}

async function paystackRequest<T>(
  path: string,
  method: "GET" | "POST",
  body?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = (await response.json()) as { status: boolean; message: string; data: T };

  if (!response.ok || !json.status) {
    throw new Error(`Paystack request failed: ${json.message}`);
  }

  return json.data;
}

interface InitializeTransactionResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export function initializeTransaction(
  email: string,
  amount: number,
  reference: string,
  callbackUrl: string
): Promise<InitializeTransactionResponse> {
  return paystackRequest<InitializeTransactionResponse>("/transaction/initialize", "POST", {
    email,
    amount: toSubunit(amount),
    currency: "GHS",
    reference,
    callback_url: callbackUrl,
  });
}

interface VerifyTransactionResponse {
  status: "success" | "failed" | "abandoned";
  reference: string;
  amount: number;
}

export function verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
  return paystackRequest<VerifyTransactionResponse>(`/transaction/verify/${reference}`, "GET");
}

interface RefundResponse {
  status: string;
  amount: number;
  transaction: { reference: string };
}

export function refundTransaction(reference: string, amount: number): Promise<RefundResponse> {
  return paystackRequest<RefundResponse>("/refund", "POST", {
    transaction: reference,
    amount: toSubunit(amount),
  });
}

export { toSubunit, fromSubunit };