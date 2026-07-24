import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { createOrder, listOrders, updateOrderStatus } from "./queries/orders";
import { sendOrderNotification } from "./email";

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
      await createOrder(input);
      try {
        await sendOrderNotification(input);
      } catch (err) {
        console.error("Failed to send order notification email", err);
      }
      return { ok: true };
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
