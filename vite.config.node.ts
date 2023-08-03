import { defineConfig, createLogger } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePluginNode } from "vite-plugin-node"
// import TurboConsole from "vite-plugin-turbo-console";


// https://vitejs.dev/config/
export default defineConfig({
    server: {
        host:"192.168.123.120",
        port: 3006,
        cors: true
    },
    plugins: [
        // TurboConsole(),
        ...VitePluginNode({
            adapter: 'express',
            appPath: './src/server/server.ts',

        }),
    ],
})
