import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePluginNode } from "vite-plugin-node"

// https://vitejs.dev/config/
export default defineConfig({
    // 原始
    plugins: [vue()],
    server: {
        host: "192.168.123.120",
        port: 3005
    },

})
