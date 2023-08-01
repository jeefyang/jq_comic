import * as streamZip from "node-stream-zip"
import { JZipChild } from "./zipChild"

export class JZipFactory {

    children: { obj: JZipChild, key: string, freeTime: number }[] = []
    /** 最大压缩包存活数量,减轻服务器的压力 */
    maxCount: number = 10

    constructor() {

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
    async maxClearCache() {
        if (this.maxCount > this.children.length) {
            return
        }
        this.children.sort((a, b) => {
            return a.obj.isWork ? -1 : b.obj.isWork ? 1 : b.freeTime - a.freeTime
        })
        let child = this.children[0]
        if (child.obj.isWork) {
            return
        }
        await child.obj.destory()
        await this.maxClearCache()
        return
    }


    /** 创建子对象 */
    async createChild(url: string) {
        let child = new JZipChild()
        await child.init(url)
        this.children.push({ obj: child, key: child.url, freeTime: child.freeTime })
        child.destroyCB = () => {
            let index = this.children.findIndex(c => c.obj == child)
            if (index != -1) {
                this.children.splice(index, 1)
            }
        }
        child.setRollDestory(true)
        this.maxClearCache()
        return child
    }

    /** 获取子对象 */
    async getChild(url: string) {
        let index = this.children.findIndex(c => c.key == url)
        if (index == -1) {
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