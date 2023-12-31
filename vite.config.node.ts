import { defineConfig, loadEnv } from 'vite'
import { VitePluginNode } from "vite-plugin-node"
// import { watchAndRun } from "vite-plugin-watch-and-run"
import fs from "fs"
import { JConfigType } from "./src/type"



const jsonStr = fs.readFileSync("./public/config.jsonc", "utf-8")
const configjson: JConfigType = global.eval(`(${jsonStr})`)


// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), "")
    return {
        server: {
            host: configjson.node_dev_domain || undefined,
            port: configjson.node_dev_port,
            cors: true,
            env: env,
        },
        plugins: [
            // TurboConsole(),
            ...VitePluginNode({
                adapter: 'express',
                appPath: './src/server/server.ts',
            }),
            // watchAndRun([
            //     {
            //         watchKind: ['add', 'change', "unlink"],
            //         watch: resolve('./src/server/**/*.ts'),
            //         delay: 1000,
            //         run: "npm run dev:node"
            //     }
            // ])
        ],
    }
})
