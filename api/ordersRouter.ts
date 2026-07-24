import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  createOrder,
  getOrderById,
  listOrders,
  markOrderPaid,
  setStripeSessionId,
  updateOrderStatus,
} from "./queries/orders";
import { sendOrderNotification, sendPaymentReceived } from "./email";
import { createCheckoutSession, getCheckoutSession } from "./stripe";
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
      if (!env.stripeSecretKey) throw new Error("Payments not configured yet");
      const order = await getOrderById(input.orderId);
      if (!order) throw new Error("Order not found");
      const origin = new URL(ctx.req.url).origin;
      const session = await createCheckoutSession({
        orderId: Number(order.id),
        amountCents: order.total,
        description: `CustomPSControllers order #${order.id}`,
        origin,
        customerEmail: order.email,
        method: order.paymentMethod,
      });
      await setStripeSessionId(Number(order.id), session.id);
      return { checkoutUrl: session.url };
    }),

  checkPayment: publicQuery
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      const order = await getOrderById(input.orderId);
      if (!order?.stripeSessionId || !env.stripeSecretKey) return { status: "unknown" };
      const session = await getCheckoutSession(order.stripeSessionId);
      if (session.payment_status === "paid" && order.status !== "paid") {
        await markOrderPaid(input.orderId);
        try {
          await sendPaymentReceived({
            orderId: input.orderId,
            customerName: order.customerName,
            email: order.email,
            total: order.total,
          });
        } catch (err) {
          console.error("Failed to send payment email", err);
        }
      }
      return { status: session.payment_status };
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
