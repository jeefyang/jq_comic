import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueTsx from "@vitejs/plugin-vue-jsx"
// import fs from "fs"
// import { JConfigType } from "./src/type"


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {

    return {

        // 原始
        plugins: [vue(),vueTsx()],
        build: {
            minify: mode == "development" ? false : true
        }
    }
})
