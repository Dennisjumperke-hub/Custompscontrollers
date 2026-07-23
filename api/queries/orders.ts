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
  await getDb().insert(orders).values(data);
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
