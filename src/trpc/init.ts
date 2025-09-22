import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { polarClient } from '@/lib/polar';
import { db } from '@/db';
import { eq, count } from 'drizzle-orm';

import { agents, meetings } from '@/db/schema';
import { MAX_FREE_AGENTS, MAX_FREE_MEETINGS } from '@/modules/premium/constants';

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: 'user_123' };
});

// Base TRPC setup
const t = initTRPC.create({
  // transformer: superjson, // enable if you use superjson
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const incomingHeaders = await headers(); // ✅ await since it's async
  const session = await auth.api.getSession({
    headers: new Headers(incomingHeaders), 
  });

  if (!session) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
  }

  return next({ ctx: { ...ctx, auth: session } });
});


export const premiumProcedure = (entity: 'meetings' | 'agents') =>
  protectedProcedure.use(async ({ ctx, next }) => {
    const customer = await polarClient.customers.getStateExternal({
      externalId: ctx.auth.user.id,
    });

    const [userMeetings] = await db
      .select({
        count: count(meetings.id),
      })
      .from(meetings)
      .where(eq(meetings.userId, ctx.auth.user.id));

    const [userAgents] = await db
      .select({
        count: count(agents.id),
      })
      .from(agents)
      .where(eq(agents.userId, ctx.auth.user.id));

    // ✅ ensure numeric comparison works in prod
    const userMeetingsCount = Number(userMeetings.count);
    const userAgentsCount = Number(userAgents.count);

    const isPremium = customer.activeSubscriptions.length > 0;
    const isFreeAgentLimitReached = userAgentsCount >= MAX_FREE_AGENTS;
    const isFreeMeetingLimitReached = userMeetingsCount >= MAX_FREE_MEETINGS;

    const shouldThrowMeetingError =
      entity === 'meetings' && isFreeMeetingLimitReached && !isPremium;

    const shouldThrowAgentError =
      entity === 'agents' && isFreeAgentLimitReached && !isPremium;

    if (shouldThrowMeetingError) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `You have reached the free meetings limit. Please upgrade to create more meetings.`,
      });
    }

    if (shouldThrowAgentError) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `You have reached the free agents limit. Please upgrade to create more agents.`,
      });
    }

    return next({ ctx: { ...ctx, customer } });
  });
