import express from "express"
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router';
import cors from "cors"
import fs from "fs"
import path from "path"


import { zipFactory } from "./zipFactory";
import { URL } from 'node:url';
// import { SqliteFactory } from "./sqliteFactory";
import mime from "mime"
import { configjson } from "./data"

console.log("start!!!")
const app = express()
app.use(cors())
// let mydb: SqliteFactory


// readZip("./server_data/1.zip")

app.use('/trpc', createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
}))
app.get('/test', async (_req, res, next) => {
    res.status(200).set({ "Content-Type": "text/html" }).end("helloworld")
    next()
})

app.get("/getZipInFileByName", async (req, res) => {
    // req.url
    let urldata = new URL(req.url, `http://${req.headers.host}`)
    let key = urldata.searchParams.get("key")
    let base = configjson.switchUrlList.find(c => c.key == key)?.url
    if (base == undefined) {
        console.warn(`无法找到对应key值 '${key}' 所在的目录`)
        res.sendStatus(404)

        return
    }

    let fileUrl = urldata.searchParams.get("url")
    let fileName = urldata.searchParams.get("fileName")
    let completeUrl = path.join(base, fileUrl)
    try {
        console.log(`加载压缩包文件 '${completeUrl}' 中的 '${fileName}'`)
        let data = await (await zipFactory.getChild(completeUrl)).getFileByName(fileName)
        res.send(data)
    }
    catch {
        console.warn(`无法找到在压缩包'${completeUrl}'找到文件'${fileName}'`)
        res.sendStatus(404)
    }
    return
})

app.get("/getFile", async (req, res) => {
    let urldata = new URL(req.url, `http://${req.headers.host}`)
    let key = urldata.searchParams.get("key")
    let base = configjson.switchUrlList.find(c => c.key == key)?.url
    if (base == undefined) {
        console.warn(`无法找到对应key值 '${key}' 所在的目录`)
        res.sendStatus(404)
        return

    }
    let fileUrl = urldata.searchParams.get("url")
    let completeUrl = path.join(base, fileUrl)
    try {
        console.log(`加载文件 ${completeUrl}`)
        let data = await fs.readFileSync(completeUrl)
        res.send(data)
    }
    catch {
        console.warn(`无法找到文件'${completeUrl}'`)
        res.sendStatus(404)
    }
    return
})


app.get("*", async (req, res) => {

    let url = ""
    if (import.meta.env.MODE == "development") {
        url = `./.dev_vue${req.path}`
    }
    else if (import.meta.env.MODE == "production") {
        url = `./build_vue${req.path}`
    }
    console.log(`加载网页文件:${url}`)
    if (fs.existsSync(url) && fs.statSync(url).isFile()) {
        res.setHeader("Content-Type", mime.getType(url))
        res.send(fs.readFileSync(url))
        return
    }
    console.log(`无法加载文件:${url}`)
    if (import.meta.env.MODE == "development") {
        url = `./.dev_vue${req.url}`
    }
    else if (import.meta.env.MODE == "production") {
        url = `./build_vue${req.url}`
    }

    console.log(`尝试加载网页文件:${url}`)
    if (fs.existsSync(url) && fs.statSync(url).isFile()) {
        res.setHeader("Content-Type", mime.getType(url))
        res.send(fs.readFileSync(url))
        return
    }
    console.log(url, 404)
    res.sendStatus(404)
    return
})

if (import.meta.env.MODE == "development") {

}
else {

}

app.listen(configjson.listen)
console.log("正在监听:", configjson.listen)
// mydb = new SqliteFactory("./base")



export const viteNodeApp = app;