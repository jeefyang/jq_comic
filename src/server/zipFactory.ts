// import * as streamZip from "node-stream-zip"
import { JZipChild } from "./zipChild"
import path from "path"
import colors from "colors-console"
import { JThum } from "./thum"
import { configjson } from "./data"

export class JZipFactory {

    children: { obj: JZipChild, key: string, freeTime: number }[] = []
    /** 缩略图功能 */
    thum: JThum

    constructor(
        /** 最大压缩包存活数量,减轻服务器的压力 */
        public zipCacheCount: number,
        zipThumOutDir: string,
        magickCmd: string) {
        this.thum = new JThum(magickCmd, zipThumOutDir)
    }

    /** 清空缓存
     * @param isForce 是否强制,如果不是强制,则压缩包正在工作则跳过
     */
    async clearCache(isForce?: boolean) {
        for (let i = this.children.length - 1; i >= 0; i--) {
            let child = this.children[i]
            if (!isForce && child.obj.isWork) {
                continue
            }
            this.children.splice(i, 1)
            await child.obj.destory()
        }
        return
    }

    /** 按照最大存活数量筛选清空缓存 */
    async maxClearCache(noclearChild?: JZipChild) {
        if (this.zipCacheCount > this.children.length) {
            console.log(`当前缓存压缩包:${JSON.stringify(this.children.map(c => {
                return { url: c.obj.url, iswork: c.obj.isWork, freetime: new Date(c.obj.freeTime) }
            }))}`)
            return
        }
        this.children.sort((a, b) => {
            return a.obj.isWork ? -1 : b.obj.isWork ? 1 : b.freeTime - a.freeTime
        })
        let child = this.children[0]
        if (noclearChild && noclearChild.url == child.key) {
            return
        }
        if (child.obj.isWork) {
            // console.log()
            return this.maxClearCache(noclearChild)
        }
        console.log(colors("redBG", `缓存已满,删除缓存中压缩包 ${child.key}`))
        await child.obj.destory()
        await this.maxClearCache(noclearChild)
        return
    }


    /** 创建子对象 */
    async createChild(url: string) {
        let child = new JZipChild()
        await child.init(path.join(url))
        this.children.push({ obj: child, key: path.join(child.url), freeTime: child.freeTime })
        child.destroyCB = () => {
            let key = path.join(child.url)
            this.children = this.children.filter(c => c.key != key)
            console.log(colors("redBG", `缓存已经删除压缩包:${key}`))
            // let index = this.children.findIndex(c => c.obj == child)
            // if (index != -1) {
            //     this.children.splice(index, 1)
            // }
        }
        console.log(`内存缓存压缩包文件:${url}`)
        child.setRollDestory(true)
        this.maxClearCache(child)
        return child
    }

    /** 获取子对象 */
    async getChild(url: string) {

        let index = this.children.findIndex(c => c.key == url)
        if (index == -1) {
            console.log(`加载压缩包:${url}`)
            return await this.createChild(url)
        }
        return this.children[index].obj
    }

    /** 删除子对象 */
    async delChild(url: string) {
        let index = this.children.findIndex(c => c.key == url)
        if (index == -1) {
            return
        }
        let child = this.children[index]
        await child.obj.destory()
        return
    }

}

export const zipFactory = new JZipFactory(configjson.zipCacheCount || 0, configjson.thumOutDir || "thumbnail", configjson.magickCmd || "magick")