import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc';
import { authRouter } from '@/server/api/routers/auth';
import { templateRouter } from '@/server/api/routers/template';
import { invitationRouter } from '@/server/api/routers/invitation';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  template: templateRouter,
  invitation: invitationRouter,
  // TODO: Add other routers here as they are implemented
  // rsvp: rsvpRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
