import { env } from "./lib/env";

const MOLLIE_API = "https://api.mollie.com/v2";

export type MolliePayment = {
  id: string;
  status: string;
  amount: { value: string; currency: string };
  _links?: { checkout?: { href: string } };
};

async function mollieFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${MOLLIE_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.mollieApiKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mollie API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function createMolliePayment(opts: {
  amountCents: number;
  description: string;
  redirectUrl: string;
  webhookUrl: string;
  orderId: number;
  method?: "bancontact" | "creditcard";
}) {
  const payment = await mollieFetch<MolliePayment>("/payments", {
    method: "POST",
    body: JSON.stringify({
      amount: {
        currency: "EUR",
        value: (opts.amountCents / 100).toFixed(2),
      },
      description: opts.description,
      redirectUrl: opts.redirectUrl,
      webhookUrl: opts.webhookUrl,
      metadata: { orderId: opts.orderId },
      ...(opts.method ? { method: opts.method } : {}),
    }),
  });
  return payment;
}

export async function getMolliePayment(id: string) {
  return mollieFetch<MolliePayment>(`/payments/${id}`);
}
