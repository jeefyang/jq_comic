import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { JZipFactory } from './zipFactory';
// import { async } from 'node-stream-zip';
import path from "path"
import { decodeFolder } from './decodeFolder';
import fs from 'fs'


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
  /** 测试压缩包 */
  testZip: publicProcedure.input(z.object({ url: z.string() })).mutation(async ({ input }) => {
    let url = path.join(input.url)
    let data = (await zipFactory.getChild(url)).entryList
    return data
  }),
  /** 获取压缩文件信息 */
  getZipMsg: publicProcedure.input(z.object({ url: z.string() })).mutation(async ({ input }) => {
    let url = path.join(input.url)
    let zip = (await zipFactory.getChild(url))
    return { list: zip.entryList }
  }),
  /** 获取压缩包里文件 */
  getZipInFile: publicProcedure.input(z.object({ url: z.string(), orderNO: z.number() })).mutation(async ({ input }) => {
    let url = path.join(input.url)
    let data = await (await zipFactory.getChild(url)).getFileByNo(input.orderNO)
    return data
  }),
  /** 获取压缩包里文件的信息 */
  getZipInFileMsg: publicProcedure.input(z.object({ url: z.string(), orderNO: z.number() })).mutation(async ({ input }) => {
    let url = path.join(input.url)
    let data = await (await zipFactory.getChild(url)).entryList[input.orderNO]
    return data
  }),
  /** 获取文件数据 */
  getFile: publicProcedure.input(z.object({ url: z.string() })).mutation(async ({ input }) => {
    let url = path.join(input.url)
    let data = await fs.readFileSync(url)
    return data
  }),

  /** 获取文件夹数据 */
  getFolder: publicProcedure.input(z.object({ baseUrl: z.string(), url: z.string() })).mutation(async ({ input }) => {
    let obj = decodeFolder(input.baseUrl, input.url)
    return obj
  })

});

export const appRouter = router({
  main: mainRouter,
});

export type AppRouter = typeof appRouter;
