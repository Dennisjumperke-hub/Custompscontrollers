import { desc, eq } from "drizzle-orm";
import { orders } from "@db/schema";
import { getDb } from "./connection";

export type NewOrder = {
  customerName: string;
  email: string;
  address: string;
  paymentMethod: "visa" | "bancontact";
  items: string;
  subtotal: number;
  shipping: number;
  total: number;
};

export async function createOrder(data: NewOrder) {
  const result = await getDb().insert(orders).values(data).$returningId();
  return result[0].id;
}

export async function getOrderById(id: number) {
  const rows = await getDb().select().from(orders).where(eq(orders.id, id));
  return rows[0];
}

export async function setStripeSessionId(id: number, stripeSessionId: string) {
  await getDb().update(orders).set({ stripeSessionId }).where(eq(orders.id, id));
}

export async function getOrderByStripeSession(stripeSessionId: string) {
  const rows = await getDb()
    .select()
    .from(orders)
    .where(eq(orders.stripeSessionId, stripeSessionId));
  return rows[0];
}

export async function markOrderPaid(id: number) {
  await getDb().update(orders).set({ status: "paid" }).where(eq(orders.id, id));
}

export async function listOrders() {
  return getDb().select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(
  id: number,
  status: "new" | "paid" | "shipped" | "done"
) {
  await getDb().update(orders).set({ status }).where(eq(orders.id, id));
}
