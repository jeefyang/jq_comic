import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from "fs"
import { JConfigType } from "./src/type"


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {

    return {

        // 原始
        plugins: [vue()],
        build: {
            minify: mode == "development" ? false : true
        }
    }
})
