import { cache } from 'react';
import { headers } from 'next/headers';
import { createCallerFactory, createTRPCContext } from '@/server/api/trpc';
import { appRouter } from '@/server/api/root';

// AIDEV-NOTE: Server-side tRPC caller for use in Server Components and API routes

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = headers();
  // AIDEV-NOTE: Convert ReadonlyHeaders to Headers for compatibility
  const headersObj = new Headers();
  heads.forEach((value, key) => {
    headersObj.set(key, value);
  });
  
  return createTRPCContext({ headers: headersObj });
});

const createCaller = createCallerFactory(appRouter);

export const trpc = createCaller(createContext);