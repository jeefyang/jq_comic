import express from "express"
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router';
import cors from "cors"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

import { JConfigType } from "../type"
import { zipFactory } from "./zipFactory";
import { URL } from 'node:url';

console.log("start!")
const app = express()
app.use(cors())

// readZip("./server_data/1.zip")

app.use('/trpc', createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
}))
app.get('/test', async (_req, res, next) => {
    res.status(200).set({ "Content-Type": "text/html" }).end("helloworld")
    next()
})

app.get("/getZipInFileByName", async (req, res, next) => {
    // req.url
    // console.log('getZipInFileByName', req.originalUrl + '/' + req.url)
    let urldata = new URL(req.url, `http://${req.headers.host}`)
    let fileUrl = urldata.searchParams.get("url")
    let fileName = urldata.searchParams.get("fileName")
    try {
        let data = await (await zipFactory.getChild(fileUrl)).getFileByName(fileName)
        res.send(data)
    }
    catch {
        console.log(`无法找到在压缩包'${fileUrl}'找到文件'${fileName}'`)
        res.sendStatus(404)
    }
    next()
})

app.get("/getFile", async (req, res, next) => {
    let url = new URL(req.url, `http://${req.headers.host}`)
    let fileUrl = url.searchParams.get("url")
    try {
        let data = await fs.readFileSync(fileUrl)
        res.send(data)
    }
    catch {
        console.log(`无法找到文件'${fileUrl}'`)
        res.sendStatus(404)
    }
    next()
})

if (import.meta.env.PROD) {
    const josnUrl = path.join(path.dirname(fileURLToPath(import.meta.url)), "config.jsonc")
    const jsonStr = fs.readFileSync(josnUrl, "utf-8")
    const configjson: JConfigType = eval(`(${jsonStr})`)
    app.listen(configjson.node_build_post)
    console.log("正在监听:", configjson.node_build_post)
}



export const viteNodeApp = app;