import * as streamZip from "node-stream-zip"
import path from 'path'

export class JZipChild {
    obj: streamZip.StreamZipAsync = undefined
    url: string
    entryList: { key: string, data: streamZip.ZipEntry }[] = []
    /** 是否正在工作,会阻止销毁的 */
    isWork = false
    /** 销毁最大等待时间 */
    destroyTime: number = 1000 * 60 * 30
    /** 记录当前空闲时间 */
    freeTime: number
    /** 销毁事件回调 */
    destroyCB: () => void
    /** 是否轮询遍历销毁 */
    private _isRollDestory: boolean = false
    /** 是否轮询遍历销毁 */
    get isRollDestory() {
        return this._isRollDestory
    }
    /** 轮询销毁事件 */
    rollDestoryEvent: NodeJS.Timeout
    rollTime: number = 1000 * 60
    /** 可读后缀名 */
    readonly canReadExList: string[] = ['bmp', "png", "apng", "jpg", "jpeg", "webp", "webm", "mp4", "gif"]

    constructor() {
        this.setFreeTime()
    }

    /** 设置空闲时间 */
    setFreeTime() {
        this.freeTime = new Date().getTime()
    }

    /** 获取时间 */
    getTime() {
        return new Date().getTime()
    }

    /** 是否超时 */
    isOverFreeTime() {
        return (this.freeTime - this.getTime()) > this.destroyTime
    }

    /** 初始化 */
    async init(url: string) {
        this.url = url
        this.isWork = true
        this.obj = await new streamZip.async({ file: this.url })
        let data = await this.obj.entries()
        for (let key in data) {
            let ex = path.extname(key)
            ex = ex.replace('.', "").toLocaleLowerCase()
            if (!this.canReadExList.includes(ex)) {
                continue
            }
            this.entryList.push({ key, data: data[key] })
        }
        this.isWork = false
        this.setFreeTime()
        return
    }

    /** 循环遍历销毁 */
    private _rollDetory() {
        if (!this._isRollDestory) {
            this.rollDestoryEvent && this.rollDestoryEvent.unref()
            this.rollDestoryEvent = undefined
            return
        }
        this.rollDestoryEvent = setTimeout(async () => {
            if (!this.isWork || this.isOverFreeTime()) {
                await this.destory()
                return
            }
            this._rollDetory()
        }, this.rollTime);
    }

    /** 触发循环遍历销毁 */
    setRollDestory(v: boolean) {
        this._isRollDestory = v
        if (v) {
            this._rollDetory()
            return
        }
        this.rollDestoryEvent && this.rollDestoryEvent.unref()
        this.rollDestoryEvent = undefined
        return
    }

    /** 销毁,如果不是特别原因,请不要直接使用 */
    async destory() {
        this.isWork = false
        this.destroyCB && this.destroyCB()
        this.obj && await this.obj.close()
        this.rollDestoryEvent && this.rollDestoryEvent.unref()
        this.rollDestoryEvent = undefined
        return
    }

    /** 通过排列顺序获取文件内容 */
    async getFileByNo(num: number) {
        let child = this.entryList[num]
        if (!child) {
            return null
        }
        let file = await this.obj.entryData(child.data.name)
        return file
    }

    /** 通过名字获取文件内容 */
    async getFileByName(name: string) {
        let file = await this.obj.entryData(name)
        return file
    }




}