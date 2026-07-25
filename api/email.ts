import { Resend } from "resend";
import { env } from "./lib/env";

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? "custom.pscontrollers@hotmail.com";

type OrderMailData = {
  customerName: string;
  email: string;
  address: string;
  paymentMethod: "visa" | "bancontact";
  items: string;
  subtotal: number;
  shipping: number;
  total: number;
};

const euro = (cents: number) => `€${(cents / 100).toFixed(2).replace(".", ",")}`;

export async function sendPaymentReceived(opts: {
  orderId: number;
  customerName: string;
  email: string;
  total: number;
}) {
  if (!env.resendApiKey) return;
  const resend = new Resend(env.resendApiKey);
  await resend.emails.send({
    from: "CustomPSControllers <onboarding@resend.dev>",
    to: NOTIFY_EMAIL,
    subject: `PAID: Order #${opts.orderId} — ${opts.customerName} — ${euro(opts.total)}`,
    text: [
      `Payment received!`,
      ``,
      `Order: #${opts.orderId}`,
      `Customer: ${opts.customerName} (${opts.email})`,
      `Amount: ${euro(opts.total)}`,
      ``,
      `The order can go into production.`,
    ].join("\n"),
  });
}

export async function sendOrderNotification(o: OrderMailData) {
  if (!env.resendApiKey) return;
  const resend = new Resend(env.resendApiKey);
  await resend.emails.send({
    from: "CustomPSControllers <onboarding@resend.dev>",
    to: NOTIFY_EMAIL,
    subject: `New order: ${o.customerName} — ${euro(o.total)}`,
    text: [
      `New order received!`,
      ``,
      `Customer: ${o.customerName}`,
      `Email: ${o.email}`,
      `Address: ${o.address}`,
      `Payment method: ${o.paymentMethod === "visa" ? "Visa" : "Bancontact"}`,
      ``,
      `Items:`,
      o.items,
      ``,
      `Subtotal: ${euro(o.subtotal)}`,
      `Shipping: ${o.shipping === 0 ? "FREE" : euro(o.shipping)}`,
      `Total: ${euro(o.total)}`,
      ``,
      `Payment to: BE40 9735 0579 9763`,
    ].join("\n"),
  });
}
