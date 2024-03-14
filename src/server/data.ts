import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

import { JConfigType } from "../type"
let josnUrl = "./config.jsonc"
if (!fs.existsSync(josnUrl)) {
    josnUrl = path.join(path.dirname(fileURLToPath(import.meta.url)), "config.jsonc")
}

const jsonStr = fs.readFileSync(josnUrl, "utf-8")
export const configjson: JConfigType = eval(`(${jsonStr})`)