import { defineConfig, loadEnv } from 'vite'
import { VitePluginNode } from "vite-plugin-node"
import fs from "fs"
// import { watchAndRun } from "vite-plugin-watch-and-run"


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    if (mode == 'production') {
        let url = "./config.jsonc"
        let example = './config.example.jsonc'
        if (!fs.existsSync(url)) {
            fs.writeFileSync(url, fs.readFileSync(example))
            console.log(`写入配置文件:${url}`)
        }
    }
    console.log(mode)
    return {
        plugins: [
            // TurboConsole(),
            ...VitePluginNode({
                adapter: 'express',
                appPath: './src/server/server.ts',
            }),

        ],
    }
})
