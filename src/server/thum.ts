
import { exec } from "child_process"
import fs from "fs"
import path from "path"
import { sha1 } from "js-sha1"
import { get16To32 } from "../tool/util"

export class JThum {

    constructor(public magickCmd: string, public outDir: string) {
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true })
        }
    }

    async setThum(w: number, h: number, inputFile: string, outFile: string) {
        return new Promise<boolean>((res) => {
            let cmd = `${this.magickCmd} -resize ${w}x${h} "${inputFile}" "${outFile}"`
            exec(cmd, (err, _stdout, _stderr) => {
                if (!err) {
                    res(true)
                    return
                }
                res(false)
            })
        })
    }

    getOutFilePath(inputFile: string, key: string) {
        let hash = sha1.create()
        hash.update(inputFile)
        let a = hash.hex()
        let hex32 = get16To32(a)
        return path.join(this.outDir, `${key}_${hex32}.jpg`)
    }

    async quickSetThum(w: number, h: number, inputFile: string, key: string) {
        let outFile = this.getOutFilePath(inputFile, key)
        return this.setThum(w, h, inputFile, outFile)
    }

}