import streamZip from "node-stream-zip"
import path from 'path'
import colors from
    "colors-console"
export class JZipChild {
    obj: streamZip.StreamZipAsync = undefined
    url: string
    entryList: { key: string, data: streamZip.ZipEntry }[] = []

    /** 是否正在工作,会阻止销毁的 */
    private _isWork: boolean
    /** 是否正在工作,会阻止销毁的 */
    get isWork() { return this._isWork }
    set isWork(data) {
        this._isWork = data
        if (data == false) {
            this.setFreeTime()
        }
    }
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
    rollTime: number = 1000 * 60 * 3
    /** 可读后缀名 */
    readonly canReadExList: string[] = ['bmp', "png", "apng", "jpg", "jpeg", "webp", "webm", "mp4", "gif"]

    constructor() {
        this.isWork = false
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
        console.log(colors("red", `正在初始化压缩包:${url}`))
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
        console.log(colors("cyan", `压缩包:${url} 初始化成功`))
        return
    }

    /** 循环遍历销毁 */
    private _rollDetory() {
        if (!this._isRollDestory) {
            console.log(colors("redBG", `压缩包 ${this.url} 循环销毁关闭`))
            this.rollDestoryEvent && this.rollDestoryEvent.unref()
            this.rollDestoryEvent = undefined
            return
        }
        this.rollDestoryEvent = setTimeout(async () => {
            if (!this.isWork || this.isOverFreeTime()) {
                console.log(colors("redBG", `压缩包 ${this.url} 不工作或者超时,执行销毁`))
                await this.destory()
                return
            }
            console.log(colors("redBG", `压缩包 ${this.url} 继续循环销毁中`))
            this._rollDetory()
        }, this.rollTime);
    }

    /** 触发循环遍历销毁
     * @param v true 为轮询检查销毁;false 为直接销毁
     */
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
        this._isRollDestory = false
        return
    }

    /** 通过排列顺序获取文件内容 */
    async getFileByNo(num: number) {
        let child = this.entryList[num]
        if (!child) {
            return null
        }
        this.isWork = true
        let file = await this.obj.entryData(child.data.name)
        this.isWork = false
        return file
    }

    /** 通过名字获取文件内容 */
    async getFileByName(name: string) {
        this.isWork = true
        let file = await this.obj.entryData(name)
        this.isWork = false
        return file
    }

    /** 通过名字获取文件内容b64 */
    async getFileBase64ByName(name: string) {
        this.isWork = true
        let file = await this.obj.entryData(name)
        this.isWork = false
        return file.toString("base64")
    }




}