import { createRouter, publicQuery } from "./middleware";
import { ordersRouter } from "./ordersRouter";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  orders: ordersRouter,
});

export type AppRouter = typeof appRouter;
