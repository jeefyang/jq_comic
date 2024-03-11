import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { zipFactory } from './zipFactory';
// import { async } from 'node-stream-zip';
import path from "path"
import { decodeFolder } from './decodeFolder';
import fs from 'fs'
import { configjson } from "./data"

const t = initTRPC.create();

const publicProcedure = t.procedure;
const router = t.router;



const mainRouter = router({
  greeting: publicProcedure
    .input(z.object({ name: z.string() }).nullish())
    .query(({ input }) => {
      return `Hello ${input?.name ?? 'World'}`;
    }),
  /** 测试压缩包 */
  testZip: publicProcedure.input(z.object({ key: z.string(), url: z.string() })).mutation(async ({ input }) => {
    let base = configjson.switchUrlList.find(c => c.key == input.key)?.url
    if (base == undefined)
      return undefined
    let url = path.join(base, input.url)
    let data = (await zipFactory.getChild(url)).entryList
    return data
  }),
  /** 获取压缩文件信息 */
  postZipMsg: publicProcedure.input(z.object({ key: z.string(), url: z.string() })).mutation(async ({ input }) => {
    let base = configjson.switchUrlList.find(c => c.key == input.key)?.url
    if (base == undefined)
      return undefined
    let url = path.join(base, input.url)
    let zip = (await zipFactory.getChild(url))
    return { list: zip.entryList }
  }),
  /** 通过名称获取压缩包里文件 */
  postZipInFileByName: publicProcedure.input(z.object({ key: z.string(), url: z.string(), fileName: z.string() })).mutation(async ({ input }) => {
    let base = configjson.switchUrlList.find(c => c.key == input.key)?.url
    if (base == undefined)
      return undefined
    let url = path.join(base, input.url)
    let data = await (await zipFactory.getChild(url)).getFileByName(input.fileName)
    return data
  }),
  /** 通过名称获取压缩包里文件 */
  getZipInFileByName: publicProcedure.input(z.object({ key: z.string(), url: z.string(), fileName: z.string() })).query(async ({ input }) => {
    let base = configjson.switchUrlList.find(c => c.key == input.key)?.url
    if (base == undefined)
      return undefined
    let url = path.join(base, input.url)
    let data = await (await zipFactory.getChild(url)).getFileByName(input.fileName)
    return data
  }),
  /** 通过名称获取压缩包里文件b64 */
  postZipInFileBase64ByName: publicProcedure.input(z.object({ key: z.string(), url: z.string(), fileName: z.string() })).mutation(async ({ input }) => {
    let base = configjson.switchUrlList.find(c => c.key == input.key)?.url
    if (base == undefined)
      return undefined
    let url = path.join(base, input.url)
    let data = await (await zipFactory.getChild(url)).getFileBase64ByName(input.fileName)
    return data
  }),
  /** 通过名称获取压缩包里文件b64 */
  getZipInFileBase64ByName: publicProcedure.input(z.object({ key: z.string(), url: z.string(), fileName: z.string() })).query(async ({ input }) => {
    let base = configjson.switchUrlList.find(c => c.key == input.key)?.url
    if (base == undefined)
      return undefined
    let url = path.join(base, input.url)
    let data = await (await zipFactory.getChild(url)).getFileBase64ByName(input.fileName)
    return data
  }),
  /** 获取文件数据 */
  postFile: publicProcedure.input(z.object({ key: z.string(), url: z.string() })).mutation(async ({ input }) => {
    let base = configjson.switchUrlList.find(c => c.key == input.key)?.url
    if (base == undefined)
      return undefined
    let url = path.join(base, input.url)
    let data = await fs.readFileSync(url)
    return data
  }),
  /** 获取文件数据 */
  getFile: publicProcedure.input(z.object({ key: z.string(), url: z.string() })).query(async ({ input }) => {
    let base = configjson.switchUrlList.find(c => c.key == input.key)?.url
    if (base == undefined)
      return undefined
    let url = path.join(base, input.url)
    let data = await fs.readFileSync(url)
    return data
  }),

  /** 获取文件数据b64 */
  postFileBase64: publicProcedure.input(z.object({ key: z.string(), url: z.string() })).mutation(async ({ input }) => {
    let base = configjson.switchUrlList.find(c => c.key == input.key)?.url
    if (base == undefined)
      return undefined
    let url = path.join(base, input.url)
    let data = await fs.readFileSync(url, "base64")
    return data
  }),
  /** 获取文件夹数据 */
  postFolder: publicProcedure.input(z.object({ key: z.string(), url: z.string() })).mutation(async ({ input }) => {
    let base = configjson.switchUrlList.find(c => c.key == input.key)?.url
    if (base == undefined) {
      return undefined
    }
    let obj = decodeFolder(base, input.url)
    return obj
  }),
  /** 是否为文件 */
  postIsFile: publicProcedure.input(z.object({ key: z.string(), url: z.string() })).mutation(async ({ input }) => {
    let base = configjson.switchUrlList.find(c => c.key == input.key)?.url
    if (base == undefined)
      return undefined
    let msg = fs.statSync(path.join(base, input.url))
    return msg.isFile()
  })

});

export const appRouter = router({
  main: mainRouter,
});

export type AppRouter = typeof appRouter;
