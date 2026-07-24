import Stripe from "stripe";
import { env } from "./lib/env";

function getStripe() {
  return new Stripe(env.stripeSecretKey);
}

export async function createCheckoutSession(opts: {
  orderId: number;
  amountCents: number;
  description: string;
  origin: string;
  customerEmail: string;
  method: "visa" | "bancontact";
}) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: opts.method === "bancontact" ? ["bancontact"] : ["card"],
    customer_email: opts.customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: opts.amountCents,
          product_data: { name: opts.description },
        },
      },
    ],
    metadata: { orderId: String(opts.orderId) },
    success_url: `${opts.origin}/?payment=success&order=${opts.orderId}`,
    cancel_url: `${opts.origin}/?payment=cancelled`,
  });
  return { id: session.id, url: session.url };
}

export async function getCheckoutSession(id: string) {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(id);
}

export function constructWebhookEvent(payload: string, signature: string) {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    env.stripeWebhookSecret
  );
}
