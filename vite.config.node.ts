import { defineConfig, loadEnv } from 'vite'
import { VitePluginNode } from "vite-plugin-node"
// import { watchAndRun } from "vite-plugin-watch-and-run"


// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
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
