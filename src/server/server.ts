import express from "express"
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router';
import cors from "cors"
import * as streamZip from "node-stream-zip"

console.log(streamZip)
const app = express()
app.use(cors())

app.use('/trpc', createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
}))
app.get('/test', async (_req, res, _next) => {
    res.status(200).set({ "Content-Type": "text/html" }).end("helloworld")
})



export const viteNodeApp = app;