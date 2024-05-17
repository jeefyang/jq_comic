export type JPos = { x: number, y: number }

export class JTouch {

    /** 是否判断为移动了 */
    isTouchMove: boolean = false
    /** 判断移动的距离 */
    touchMoveDelta: number = 4
    /** 滑动判断距离,默认为移动距离 */
    swipeTouchDelta: number
    clickFunc: (x: number, y: number) => void
    dblclickFunc: (x: number, y: number) => void
    swipeFunc: (start: { x: number, y: number }, end: { x: number, y: number }, time: number) => void
    /** 滑动触发间隔 */
    swipeInterval: number = 300
    /** 双击触发间隔 */
    dblInterval: number = 300
    /** 双击触发后保护时间 */
    dblProtectTime: number = 100
    swipeT: NodeJS.Timeout
    /** 冲突延迟 */
    clashDelay: number = 10
    // /** 滑动触发延迟 */
    // swipeDelay:number=300
    /** 点击触发延迟 */
    clickDelay: number = 300
    /** 用于区分鼠标或者触摸 */
    touchKey: string
    /** 是否多点触摸 */
    isMultiTouch = false
    /** 按下时间 */
    downTime: number
    /** 按下坐标 */
    downP: { x: number, y: number }
    /** 放开时间 */
    upTime: number
    /** 放开坐标 */
    upP: { x: number, y: number }
    /** 移动坐标 */
    moveP: { x: number, y: number }
    /** 是否正在触发双击,,避免特殊设备特殊情况 */
    isdblClick: boolean = false
    /** 是否正在触发滑动,避免特殊设备特殊情况 */
    isSwipe: boolean = false
    /** 事件触发对象 */
    touchO: {
        t: NodeJS.Timeout
        downTime: number
        upTime: number
        downX: number
        downY: number
        upX: number
        upY: number
        type: "click" | "swipe" | "dblclick"
    }


    constructor(public div: HTMLElement) {
        this.div.addEventListener('mousedown', (e) => {
            this._touchStart(e.clientX, e.clientY, "mouse")
        })
        this.div.addEventListener("mousemove", (e) => {
            if (e.button == 0 && e.buttons == 1) {
                this._touchMove(e.clientX, e.clientY, "mouse")
            }
        })
        this.div.addEventListener('mouseup', (e) => {
            this._touchEnd(e.clientX, e.clientY, "mouse")
        })

        this.div.addEventListener("touchstart", (e) => {
            if (e.touches.length > 1) {
                this.isMultiTouch = true
                return
            }
            e.touches.length == 1 && this._touchStart(e.touches[0].clientX, e.touches[0].clientY, "touch")
        })
        this.div.addEventListener("touchmove", (e) => {
            this._touchMove(e.touches[0].clientX, e.touches[0].clientY, "touch")
        })
        this.div.addEventListener('touchend', (e) => {
            if (this.isMultiTouch) {
                if (e.touches.length == 0) {
                    this.isMultiTouch = false
                }
                return
            }
            e.changedTouches.length == 1 && this._touchEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY, "touch")
        })
    }

    private _touchStart(x: number, y: number, key: string) {
        if (this.touchKey && this.touchKey != key) {
            return
        }
        this.downP = { x: x, y: y }
        this.downTime = new Date().getTime()
        this.touchKey = key
        this.isTouchMove = false
    }

    private _touchMove(x: number, y: number, key: string) {
        if (this.touchKey && this.touchKey != key) {
            return
        }
        this.moveP = { x: x, y: y }
        this.touchKey = key
        if (Math.abs(this.moveP.x - this.downP.x) + Math.abs(this.moveP.y - this.downP.y) >= this.touchMoveDelta) {
            this.isTouchMove = true
        }
    }

    private _touchEnd(x: number, y: number, key: string) {
        if (this.touchKey && this.touchKey != key) {
            return
        }
        if (!this.downP) {
            return
        }
        this.upTime = new Date().getTime()
        this.upP = { x: x, y: y }
        // 双击
        if (this.touchO && this.touchO.type == "click" && !this.isTouchMove && this.upTime - this.touchO.downTime < this.dblInterval) {
            this.isdblClick = true
            this.touchO.t && clearTimeout(this.touchO.t)
            this.dblclickFunc && this.dblclickFunc(x, y)
            this.touchO = undefined
            this._clear()
            setTimeout(() => {
                this.touchKey = undefined
            }, this.clashDelay);
            setTimeout(() => {
                this.isdblClick = false
            }, this.dblProtectTime);
            return
        }

        /** 点击 */
        if (!this.touchO && !this.isTouchMove && !this.isdblClick) {
            this.touchO = {
                type: "click",
                downX: this.downP.x,
                downY: this.downP.y,
                upX: this.upP.x,
                upY: this.upP.y,
                downTime: this.downTime,
                upTime: this.upTime,
                t: setTimeout(() => {
                    this.clickFunc && this.clickFunc(this.touchO.upX, this.touchO.upY)
                    this.touchO = undefined
                    this._clear()
                    setTimeout(() => {
                        this.touchKey = undefined
                    }, this.clashDelay);
                }, this.clickDelay)
            }
            return
        }

        // 滑动
        if (!this.swipeTouchDelta) {
            this.swipeTouchDelta = this.touchMoveDelta
        }
        if (
            this.isTouchMove &&
            Math.abs(this.upP.x - this.downP.x) + Math.abs(this.upP.y - this.downP.y) >= this.swipeTouchDelta &&
            this.upTime - this.downTime <= this.swipeInterval
        ) {
            this.isSwipe = true
            this.swipeFunc && this.swipeFunc(this.downP, this.upP, this.upTime - this.downTime)
            this._clear()
            setTimeout(() => {
                this.touchKey = undefined
                this.isSwipe = false
            }, this.clashDelay);
            return
        }
        this._clear()

    }

    private _clear() {
        this.isTouchMove = false
        this.isMultiTouch = false
        this.downP = undefined
    }

    setSiwpe(func: (start: JPos, end: JPos, time: number) => void) {
        this.swipeFunc = func
    }

    decodeSwipe(op:
        {
            start: JPos,
            end: JPos
        }
    ) {
        let deltaX = op.end.x - op.start.x
        let deltaY = op.end.y - op.start.y
        let absX = Math.abs(deltaX)
        let absY = Math.abs(deltaY)
        let VOH: -1 | 0 | 1 = absX == absY ? 0 : absX > absY ? 1 : -1
        let LOR: -1 | 0 | 1 = deltaX == 0 ? 0 : deltaX > 0 ? 1 : -1
        let UOB: -1 | 0 | 1 = deltaY == 0 ? 0 : deltaY > 0 ? -1 : 1
        return {
            deltaX, deltaY,
            absX, absY,
            VOH, LOR, UOB
        }
    }

    setClick(func: (x: number, y: number) => void) {
        this.clickFunc = func
    }

    setDblclick(func: (x: number, y: number) => void) {
        this.dblclickFunc = func
    }



}