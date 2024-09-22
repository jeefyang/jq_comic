import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { zipFactory } from './zipFactory';
// import { async } from 'node-stream-zip';
import path from "path"
import { decodeFolder } from './decodeFolder';
import fs from 'fs'
import { configjson, saveConfigjson } from "./data"
import { JThum } from './thum';

const t = initTRPC.create();

const publicProcedure = t.procedure;
const router = t.router;

const thumObj = new JThum(configjson.magickCmd || "magick", configjson.thumOutDir || "thumbnail")

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
    console.log(`压缩包 ${url} 文件数量:${zip.entryList.length}`)
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
    let data = fs.readFileSync(url)
    return data
  }),
  /** 获取文件数据 */
  getFile: publicProcedure.input(z.object({ key: z.string(), url: z.string() })).query(async ({ input }) => {
    let base = configjson.switchUrlList.find(c => c.key == input.key)?.url
    if (base == undefined)
      return undefined
    let url = path.join(base, input.url)
    let data = fs.readFileSync(url)
    return data
  }),

  /** 获取文件数据b64 */
  postFileBase64: publicProcedure.input(z.object({ key: z.string(), url: z.string() })).mutation(async ({ input }) => {
    let base = configjson.switchUrlList.find(c => c.key == input.key)?.url
    if (base == undefined)
      return undefined
    let url = path.join(base, input.url)
    let data = fs.readFileSync(url, "base64")
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
  }),
  /** 通过遍历文件夹批量创建缩略图列表 */
  postCreateThumListByDir: publicProcedure.input(z.object({ key: z.string(), url: z.string() })).mutation(async ({ input }) => {
    let base = configjson.switchUrlList.find(c => c.key == input.key)?.url
    if (base == undefined)
      return undefined
    let msg = fs.statSync(path.join(base, input.url))
    return msg.isFile()
  }),
  /** 创建文件夹的缩略图 */
  postCreateDirThum: publicProcedure.input(z.object({ key: z.string(), url: z.string() })).mutation(async ({ input }) => {
    let base = configjson.switchUrlList.find(c => c.key == input.key)?.url
    if (base == undefined)
      return undefined
    let msg = fs.statSync(path.join(base, input.url))
    return msg.isFile()
  }),
  /** 创建缩略图 */
  postCreateZipThum: publicProcedure.input(z.object({ key: z.string(), url: z.string() })).mutation(async ({ input }) => {
    let base = configjson.switchUrlList.find(c => c.key == input.key)?.url
    if (base == undefined)
      return undefined
    let msg = fs.statSync(path.join(base, input.url))
    return msg.isFile()
  }),
  /** 获取缩略图的情况 */
  postThumState: publicProcedure.input(z.object({ key: z.string(), url: z.string() })).mutation(async ({ input }) => {
    let base = configjson.switchUrlList.find(c => c.key == input.key)?.url
    if (base == undefined)
      return undefined
    let msg = fs.statSync(path.join(base, input.url))
    return msg.isFile()
  }),
  /** 获取缩略图的B64 */
  postGetThumB64: publicProcedure.input(z.object({ w: z.number(), h: z.number(), key: z.string(), dirUrl: z.string(), fileName: z.string(), isZip: z.boolean() })).mutation(async ({ input }) => {
    let base = configjson.switchUrlList.find(c => c.key == input.key)?.url
    if (base == undefined)
      return ""
    let fileUrl = path.join(base, input.dirUrl, input.fileName)
    console.log(fileUrl)
    let outFileUrl = await thumObj.quickSetThum(input.w, input.h, fileUrl, input.key, input.isZip)
    if (!outFileUrl) {
      return outFileUrl
    }
    let data = fs.readFileSync(outFileUrl, "base64")
    return data
  }),
  postManagerUrl: publicProcedure.input(z.object({ type: z.enum(['reback', 'folder', "isExist"]), url: z.string() })).mutation(async ({ input }) => {
    let res: { list: string[], url: string, isSuccess: boolean } = { list: [], url: "", isSuccess: false }
    if (!fs.existsSync(input.url) || !fs.statSync(input.url).isDirectory()) {
      return res
    }
    if (input.type == "isExist") {
      res.isSuccess = true
      res.url = input.url
      return res
    }
    else if (input.type == "folder") {
      let list = fs.readdirSync(input.url)
      res.url = input.url
      res.list = list
      res.isSuccess = true
      return res
    }
    else if (input.type == "reback") {
      res.url = path.dirname(input.url)
      res.isSuccess = true
      return res
    }
    return res
  }),
  /** 修改管理key */
  postMangerKey: publicProcedure.input(z.object({ type: z.enum(['add', 'del', 'upgrade', 'find']), key: z.string().optional(), url: z.string().optional() })).mutation(async ({ input }) => {
    let res: { data: typeof configjson.switchUrlList, isSuccess: boolean, desc: string } = { data: [], isSuccess: false, desc: "" }
    if (input.type == "find") {
      if (input.key) {
        let c = configjson.switchUrlList.find(o => o.key == input.key)
        res.data = c ? [c] : []
        res.isSuccess = !!c
        return res
      }
      else {
        res.data = configjson.switchUrlList
        res.isSuccess = true
        return res
      }
    }
    else if (input.type == "add") {
      if (!input.key) {
        res.desc = "关键字为空"
        return res
      }
      let c = configjson.switchUrlList.find(o => o.key == input.key)
      if (c) {
        res.data = [c]
        res.isSuccess = false
        res.desc = `关键字 '${c.key}' 已经存在`
        return res
      }
      configjson.switchUrlList.push({ key: input.key, url: input.url })
      saveConfigjson(configjson)
      res.data = configjson.switchUrlList
      res.isSuccess = true
      return res
    }
    else if (input.type == 'upgrade') {
      let c = configjson.switchUrlList.find(o => o.key == input.key)
      if (c) {
        c.url = input.url
        saveConfigjson(configjson)
        res.data = configjson.switchUrlList
        res.isSuccess = true
        return res
      }
      return res
    }
    else if (input.type == "del") {
      let c = configjson.switchUrlList.findIndex(o => o.key == input.key)
      if (c != -1) {
        res.data = [configjson.switchUrlList[c]]
        configjson.switchUrlList.splice(c, 1)
        res.isSuccess = true
        return res
      }
      return res
    }
    return res
  })
});


export const appRouter = router({
  main: mainRouter,
});

export type AppRouter = typeof appRouter;
