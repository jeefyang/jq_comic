import express from "express"
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './router';
import cors from "cors"

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



export const viteNodeApp = app;