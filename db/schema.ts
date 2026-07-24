import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
} from "drizzle-orm/mysql-core";

export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  address: text("address").notNull(),
  paymentMethod: mysqlEnum("payment_method", ["visa", "bancontact"]).notNull(),
  items: text("items").notNull(), // human-readable list of ordered items
  subtotal: int("subtotal").notNull(), // cents
  shipping: int("shipping").notNull(), // cents
  total: int("total").notNull(), // cents
  status: mysqlEnum("status", ["new", "paid", "shipped", "done"]).notNull().default("new"),
  stripeSessionId: varchar("stripe_session_id", { length: 128 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
