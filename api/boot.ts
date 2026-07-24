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

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
