import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  createOrder,
  getOrderById,
  listOrders,
  markOrderPaid,
  setMolliePaymentId,
  updateOrderStatus,
} from "./queries/orders";
import { sendOrderNotification } from "./email";
import { createMolliePayment, getMolliePayment } from "./mollie";
import { env } from "./lib/env";

const ADMIN_KEY = "Dpm5046656";

export const ordersRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        customerName: z.string().min(2),
        email: z.string().email(),
        address: z.string().min(5),
        paymentMethod: z.enum(["visa", "bancontact"]),
        items: z.string().min(1),
        subtotal: z.number().int().nonnegative(),
        shipping: z.number().int().nonnegative(),
        total: z.number().int().nonnegative(),
      })
    )
    .mutation(async ({ input }) => {
      const orderId = await createOrder(input);
      try {
        await sendOrderNotification(input);
      } catch (err) {
        console.error("Failed to send order notification email", err);
      }
      return { ok: true, orderId };
    }),

  createPayment: publicQuery
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!env.mollieApiKey) throw new Error("Payments not configured yet");
      const order = await getOrderById(input.orderId);
      if (!order) throw new Error("Order not found");
      const origin = new URL(ctx.req.url).origin;
      const payment = await createMolliePayment({
        amountCents: order.total,
        description: `CustomPSControllers order #${order.id}`,
        redirectUrl: `${origin}/?payment=success`,
        webhookUrl: `${origin}/api/mollie-webhook`,
        orderId: Number(order.id),
        method: order.paymentMethod === "visa" ? "creditcard" : "bancontact",
      });
      await setMolliePaymentId(Number(order.id), payment.id);
      return { checkoutUrl: payment._links?.checkout?.href ?? null };
    }),

  checkPayment: publicQuery
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      const order = await getOrderById(input.orderId);
      if (!order?.molliePaymentId || !env.mollieApiKey) return { status: "unknown" };
      const payment = await getMolliePayment(order.molliePaymentId);
      if (payment.status === "paid" && order.status !== "paid") {
        await markOrderPaid(input.orderId);
      }
      return { status: payment.status };
    }),

  list: publicQuery
    .input(z.object({ key: z.string() }))
    .query(({ input }) => {
      if (input.key !== ADMIN_KEY) throw new Error("Unauthorized");
      return listOrders();
    }),

  updateStatus: publicQuery
    .input(
      z.object({
        key: z.string(),
        id: z.number(),
        status: z.enum(["new", "paid", "shipped", "done"]),
      })
    )
    .mutation(async ({ input }) => {
      if (input.key !== ADMIN_KEY) throw new Error("Unauthorized");
      await updateOrderStatus(input.id, input.status);
      return { ok: true };
    }),
});
