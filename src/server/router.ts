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
  /** 通过名称获取压缩包里文件 */
  getZipInFileByName: publicProcedure.input(z.object({ url: z.string(), fileName: z.string() })).mutation(async ({ input }) => {
    let url = path.join(input.url)
    let data = await (await zipFactory.getChild(url)).getFileByName(input.fileName)
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
  }),
  /** 是否为文件 */
  isFile: publicProcedure.input(z.object({ url: z.string() })).mutation(async ({ input }) => {
    let msg = fs.statSync(input.url)
    return msg.isFile()
  })

});

export const appRouter = router({
  main: mainRouter,
});

export type AppRouter = typeof appRouter;
