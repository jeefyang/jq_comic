import express from "express"
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router';
import cors from "cors"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

import { JConfigType } from "../type"

console.log("start!")
const app = express()
app.use(cors())

// readZip("./server_data/1.zip")

app.use('/trpc', createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
}))
app.get('/test', async (_req, res, _next) => {
    res.status(200).set({ "Content-Type": "text/html" }).end("helloworld")
})

if (import.meta.env.PROD) {
    const josnUrl = path.join(path.dirname(fileURLToPath(import.meta.url)), "config.jsonc")
    const jsonStr = fs.readFileSync(josnUrl, "utf-8")
    const configjson: JConfigType = eval(`(${jsonStr})`)
    app.listen(configjson.node_build_post)
    console.log("正在监听:", configjson.node_build_post)
}



export const viteNodeApp = app;