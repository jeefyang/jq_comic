import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from "fs"
import { JConfigType } from "./src/type"

const jsonStr = fs.readFileSync("./public/config.jsonc", "utf-8")
const configjson: JConfigType = global.eval(`(${jsonStr})`)

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), "")
    return {

        // 原始
        plugins: [vue()],
        server: {
            host: configjson.vue_dev_domain || undefined,
            port: configjson.vue_dev_port,
            env: env
        }
    }
})
