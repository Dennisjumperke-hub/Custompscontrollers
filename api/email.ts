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

export async function sendOrderConfirmation(o: OrderMailData & { orderId: number }) {
  if (!env.resendApiKey) return;
  const resend = new Resend(env.resendApiKey);
  await resend.emails.send({
    from: FROM_EMAIL,
    to: o.email,
    subject: `Order confirmation #${o.orderId} — CustomPSControllers`,
    text: [
      `Hi ${o.customerName},`,
      ``,
      `Thanks for your order! We've received it and will start production once your payment arrives.`,
      ``,
      `Order #${o.orderId}:`,
      o.items,
      ``,
      `Subtotal: ${euro(o.subtotal)}`,
      `Shipping: ${o.shipping === 0 ? "FREE" : euro(o.shipping)}`,
      `Total: ${euro(o.total)}`,
      ``,
      `Please pay by bank transfer to:`,
      `BE40 9735 0579 9763`,
      `Reference: Order #${o.orderId}`,
      ``,
      `Your delivery address: ${o.address}`,
      ``,
      `Questions? Just reply to this email.`,
      ``,
      `— CustomPSControllers`,
    ].join("\n"),
  });
}

export async function sendStatusUpdate(opts: {
  orderId: number;
  customerName: string;
  email: string;
  status: "paid" | "shipped" | "done";
  total: number;
}) {
  if (!env.resendApiKey) return;
  const resend = new Resend(env.resendApiKey);
  const subjects = {
    paid: `Payment received — Order #${opts.orderId}`,
    shipped: `Your order is on its way! — Order #${opts.orderId}`,
    done: `Order completed — Order #${opts.orderId}`,
  };
  const bodies = {
    paid: [
      `Hi ${opts.customerName},`,
      ``,
      `Great news — we've received your payment of ${euro(opts.total)} for order #${opts.orderId}.`,
      `Your controller now goes into production. You'll get another email when it ships.`,
    ],
    shipped: [
      `Hi ${opts.customerName},`,
      ``,
      `Your order #${opts.orderId} has been shipped!`,
      `Keep an eye on your mailbox — it should arrive within a few working days.`,
    ],
    done: [
      `Hi ${opts.customerName},`,
      ``,
      `Your order #${opts.orderId} is marked as completed.`,
      `Enjoy your custom controller! Any questions or issues? Just reply to this email —`,
      `you have a 2-month warranty.`,
    ],
  };
  await resend.emails.send({
    from: FROM_EMAIL,
    to: opts.email,
    subject: subjects[opts.status],
    text: [...bodies[opts.status], ``, `— CustomPSControllers`].join("\n"),
  });
}

export async function sendPaymentReceived(opts: {
  orderId: number;
  customerName: string;
  email: string;
  total: number;
}) {
  if (!env.resendApiKey) return;
  const resend = new Resend(env.resendApiKey);
  await resend.emails.send({
    from: FROM_EMAIL,
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

const FROM_EMAIL = "CustomPSControllers <orders@custompscontrollers.com>";

export async function sendOrderNotification(o: OrderMailData) {
  if (!env.resendApiKey) return;
  const resend = new Resend(env.resendApiKey);
  await resend.emails.send({
    from: FROM_EMAIL,
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
