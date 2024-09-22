import fs from "fs"
import path from "path"
import { fileURLToPath } from "node:url"

import { JConfigType } from "../type"
let josnUrl = "./config.jsonc"

if (!fs.existsSync(josnUrl)) {
    josnUrl = path.join(path.dirname(fileURLToPath(import.meta.url)), "config.jsonc")
}

export function loadConfigjson(): JConfigType {
    const jsonStr = fs.readFileSync(josnUrl, "utf-8")
    return eval(`(${jsonStr})`)
}

export function saveConfigjson(data: JConfigType) {
    fs.writeFileSync(josnUrl, JSON.stringify(data, null, 4), 'utf-8')
    let o = JSON.parse(JSON.stringify(data))
    Object.assign(configjson, o)
    return configjson
}

export let configjson = loadConfigjson()