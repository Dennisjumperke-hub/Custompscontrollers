import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Mollie payment webhook — called by Mollie when payment status changes
app.post("/api/mollie-webhook", async (c) => {
  try {
    const body = await c.req.parseBody();
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) return c.text("ok");
    const { getMolliePayment } = await import("./mollie");
    const { markOrderPaid, getOrderByMollieId } = await import("./queries/orders");
    const { sendPaymentReceived } = await import("./email");
    const payment = await getMolliePayment(id);
    if (payment.status === "paid") {
      const order = await getOrderByMollieId(id);
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
  } catch (err) {
    console.error("Mollie webhook error", err);
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
