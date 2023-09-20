export class JTouch {

    lastP: { x: number, y: number }
    isTouchMove: boolean = false
    lastEvTime: number = 0
    clickFunc: (x: number, y: number) => void
    dblclickFunc: (x: number, y: number) => void
    dblDelay: number = 300
    clickT: NodeJS.Timeout
    clashDelay: number = 10
    clickKey: string
    isMultiTouch = false

    constructor(public div: HTMLElement) {
        this.div.addEventListener('mousedown', (e) => {
            this._clickTouchStart(e.clientX, e.clientY, "mouse")
        })
        this.div.addEventListener("mousemove", (e) => {

        })
        this.div.addEventListener('mouseup', (e) => {
            this._clickTouchEnd(e.clientX, e.clientY, "mouse")
        })

        this.div.addEventListener("touchstart", (e) => {
            if (e.touches.length > 1) {
                this.isMultiTouch = true
                return
            }
            e.touches.length == 1 && this._clickTouchStart(e.touches[0].clientX, e.touches[0].clientY, "touch")
        })
        this.div.addEventListener("touchmove", (e) => {

        })
        this.div.addEventListener('touchend', (e) => {
            if (this.isMultiTouch) {
                if (e.touches.length == 0) {
                    this.isMultiTouch = false
                }
                return
            }
            e.changedTouches.length == 1 && this._clickTouchEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY, "touch")
        })
    }

    private _clickTouchStart(x: number, y: number, key: string) {
        if (this.clickKey && this.clickKey != key) {
            return
        }
        this.lastP = { x: x, y: y }
        this.clickKey = key
        this.isTouchMove = false
    }

    private _clickTouchMove(x: number, y: number, key: string) {

    }

    private _clickTouchEnd(x: number, y: number, key: string) {
        if (this.clickKey && this.clickKey != key) {
            return
        }
        let time = new Date().getTime()
        if (time - this.lastEvTime < this.dblDelay) {
            this.dblclickFunc(x, y)
            this.clickT && clearTimeout(this.clickT)
            this.lastEvTime = time
            setTimeout(() => {
                this.clickKey = undefined
            }, this.clashDelay);
            return
        }
        this.lastEvTime = time

        if (!this.lastP ||
            (Math.abs(this.lastP.x - x) < 2 && Math.abs(this.lastP.y - y) < 2)
        ) {
            this.clickT = setTimeout(() => {
                this.clickFunc(x, y)
                setTimeout(() => {
                    this.clickKey = undefined
                }, this.clashDelay);
            }, this.dblDelay);
        }
    }

    setClick(func: (x: number, y: number) => void) {
        this.clickFunc = func
    }

    setDblclick(func: (x: number, y: number) => void) {
        this.dblclickFunc = func
    }



}