import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Stripe payment webhook — called by Stripe when payment status changes
app.post("/api/stripe-webhook", async (c) => {
  try {
    const signature = c.req.header("stripe-signature");
    if (!signature) return c.text("missing signature", 400);
    const payload = await c.req.text();
    const { constructWebhookEvent } = await import("./stripe");
    const { markOrderPaid, getOrderByStripeSession } = await import("./queries/orders");
    const { sendPaymentReceived } = await import("./email");
    const event = constructWebhookEvent(payload, signature);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as { id: string; payment_status: string };
      if (session.payment_status === "paid") {
        const order = await getOrderByStripeSession(session.id);
        if (order && order.status !== "paid") {
          await markOrderPaid(Number(order.id));
          await sendPaymentReceived({
            orderId: Number(order.id),
            customerName: order.customerName,
            email: order.email,
            total: order.total,
          });
        }
      }
    }
  } catch (err) {
    console.error("Stripe webhook error", err);
    return c.text("error", 400);
  }
  return c.text("ok");
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  // Auto-create database tables on startup
  try {
    const { getDb } = await import("./queries/connection");
    const { sql } = await import("drizzle-orm");
    await getDb().execute(sql`
      CREATE TABLE IF NOT EXISTS orders (
        id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
        customer_name varchar(255) NOT NULL,
        email varchar(255) NOT NULL,
        address text NOT NULL,
        payment_method enum('visa','bancontact') NOT NULL,
        items text NOT NULL,
        subtotal int NOT NULL,
        shipping int NOT NULL,
        total int NOT NULL,
        status enum('new','paid','shipped','done') NOT NULL DEFAULT 'new',
        stripe_session_id varchar(128),
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Database tables ready");
  } catch (err) {
    console.error("Failed to create database tables", err);
  }

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
