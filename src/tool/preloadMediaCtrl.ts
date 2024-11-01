class PreloadMediaCtrl {

    mediaList: { src: string, type: "img" | "video", cb?: () => void }[] = []
    intervalTime: number = 1000
    isLoopLoad: boolean = false

    curObj: {
        cb?: () => void
        src: string
        type: "img" | "video"
        imgObj?: HTMLImageElement
    } = undefined

    /** 预加载 */
    preload(src: string, type: "img" | "video", cb?: () => void) {
        this.mediaList.push({ src, type, cb })
        this._loopLoad()
    }

    /** 提前插入加载 */
    insertLoad(src: string, type: "img" | "video", cb?: () => void) {
        this.pause()
        this.mediaList.splice(0, 0, { src, type, cb })
        this._loopLoad()
    }

    /** 循环触发加载 */
    private async _loopLoad(isLoopLoad = this.isLoopLoad) {
        if (isLoopLoad) {
            return
        }
        this.isLoopLoad = true
        if (!this.mediaList[0]) {
            this.curObj = undefined
            this.isLoopLoad = false
            return
        }
        await this._load(this.mediaList[0].src, this.mediaList[0].type, this.mediaList[0].cb)
        this.mediaList.splice(0, 1)
        return this._loopLoad(false)

    }

    private async _load(src: string, type: 'img' | "video", cb?: () => void) {
        return new Promise((res, _rej) => {
            this.curObj = {

                src, type, cb
            }
            if (type == "img") {
                this.curObj.imgObj = new Image()
                this.curObj.imgObj.onload = () => {
                    if (this?.curObj?.cb) {
                        this.curObj.cb()
                    }
                    if (this?.curObj?.imgObj) {
                        this.curObj.imgObj.remove()
                    }
                    res(undefined)
                }
                this.curObj.imgObj.src = src
            }
        })

    }

    /** 等待停止 */
    async awaitStop() {
        return new Promise((res, _rej) => {
            let loopFunc = () => {
                setTimeout(() => {
                    if (!this.isLoopLoad) {
                        res(undefined)
                        return
                    }
                    if (!this.curObj) {
                        res(undefined)
                        return
                    }
                    loopFunc()
                }, this.intervalTime);
            }
            loopFunc()
        })
    }

    /** 停止(会删掉所有堆栈) */
    stop() {
        this.pause()
        this.mediaList = []
        return
    }

    /** 暂停,不删除当前堆栈 */
    pause() {
        if (this.curObj) {
            if (this.curObj.imgObj) {
                this.curObj.imgObj.src = ""
                this.curObj.imgObj.remove()
            }
        }
        this.curObj = undefined
        this.isLoopLoad = false
        return
    }
}

export const preloadMediaCtrl = new PreloadMediaCtrl()