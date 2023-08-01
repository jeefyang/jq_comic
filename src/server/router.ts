import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { JZipFactory } from './zipFactory';
import { async } from 'node-stream-zip';


const t = initTRPC.create();

const publicProcedure = t.procedure;
const router = t.router;
const zipFactory = new JZipFactory()

const mainRouter = router({
  greeting: publicProcedure
    .input(z.object({ name: z.string() }).nullish())
    .query(({ input }) => {
      return `Hello ${input?.name ?? 'World'}`;
    }),

  testZip: publicProcedure.input(z.object({ url: z.string() })).mutation(async ({ input }) => {
    let data = (await zipFactory.getChild(input.url)).entryList
    return data
  }),

  getZipImg: publicProcedure.input(z.object({ url: z.string(), orderNO: z.number() })).mutation(async ({ input }) => {
    let data = await (await zipFactory.getChild(input.url)).getFileByNo(input.orderNO)
    return data
  })

});

export const appRouter = router({
  main: mainRouter,
});

export type AppRouter = typeof appRouter;
