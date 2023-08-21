import { defineConfig, loadEnv } from 'vite'
import { VitePluginNode } from "vite-plugin-node"
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
            env: env
        },
        plugins: [
            // TurboConsole(),
            ...VitePluginNode({
                adapter: 'express',
                appPath: './src/server/server.ts',

            }),
        ],
    }
})
