
import { exec } from "child_process"
import fs from "fs"
import path from "path"
import { getThumHexName, sortABByNum } from "../tool/util"
import { JZipChild } from "./zipChild"

export class JThum {

    /** 可读后缀名 */
    readonly canReadExList: string[] = ['bmp', "png", "apng", "jpg", "jpeg", "webp", "gif"]

    constructor(public magickCmd: string, public outDir: string) {
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true })
        }
    }

    async setThum(w: number, h: number, inputFile: string, outFile: string) {
        return new Promise<boolean>((res) => {
            let cmd = `${this.magickCmd} convert -resize ${w}x${h} "${inputFile}" "${outFile}"`
            console.log(cmd)
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
        let u = getThumHexName(inputFile, key)
        return path.join(this.outDir, `${u}.jpg`)
    }

    async quickSetThum(w: number, h: number, inputFile: string, key: string, isZip?: boolean) {
        console.log(inputFile)
        let outFile = this.getOutFilePath(inputFile, key)
        if (fs.existsSync(outFile)) {
            return outFile
        }
        if (isZip) {
            let o = new JZipChild()
            await o.init(inputFile)

            o.entryList = o.entryList.sort((a, b) => sortABByNum(a, b))
            for (let i = 0; i < o.entryList.length; i++) {
                let c = o.entryList[i]
                let ex = path.extname(c.key).replace('.', "")
                if (!this.canReadExList.includes(ex.toLocaleLowerCase())) {
                    continue
                }
                let buf = await o.getFileByName(c.data.name)
                let cacheFileUrl = path.join(this.outDir, `temp.${ex}`)
                fs.writeFileSync(cacheFileUrl, buf)
                await this.setThum(w, h, cacheFileUrl, outFile)
                fs.rmSync(cacheFileUrl)
                await o.destory()
                return outFile
            }
            return ""
        }

        let check = await this.setThum(w, h, inputFile, outFile)
        console.log(inputFile, this.magickCmd, check)
        if (!check) {
            return ""
        }
        return outFile
    }



}