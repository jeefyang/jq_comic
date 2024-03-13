import { JAreaType } from "../const";
import { mediaStore } from "../mediaStore";
import { store } from "../store";
import { mainMediaCtrl } from "./mainMediaCtrl";

class JAction {

    timeList: { t?: NodeJS.Timeout, key: string, time?: number, isContinued?: boolean }[] = []

    /** 防抖 */
    debounceFunc(func: () => any, key: string, delay: number) {
        let index = this.timeList.findIndex(c => c.key == key)
        if (index != -1) {
            clearTimeout(this.timeList[index].t)
            this.timeList.splice(index, 1)
        }
        let t = setTimeout(() => {
            func()
            clearTimeout(t)
            let index = this.timeList.findIndex(c => c.key == key)
            if (index != -1) {
                this.timeList.splice(index, 1)
            }
        }, delay);
        this.timeList.push({ key, t })
    }

    /**节流 */
    throttleFunc(func: () => any, key: string, delay: number) {
        let index = this.timeList.findIndex(c => c.key == key)
        let time = new Date().getTime()
        if (index == -1) {
            func()
            this.timeList.push({ time, key })
            return
        }
        let child = this.timeList[index]
        if (time - child.time > delay) {
            func()
            child.time = time
        }
    }

    /** 持续 */
    continuedFunc(func: () => any, key: string, delay: number, isInward?: boolean) {
        let index = this.timeList.findIndex(c => c.key == key)
        if (index == -1) {

            this.timeList.push({ key })
            func()
            setTimeout(() => {
                this.continuedFunc(func, key, delay, true)
            }, delay);
            return
        }
        let child = this.timeList[index]
        // 外部触发
        if (!isInward) {
            child.isContinued = true
        }
        // 内部触发
        else {
            if (child.isContinued) {
                child.isContinued = false
                func()
                this.continuedFunc(func, key, delay, true)
                return
            }
            else {
                this.timeList.splice(index, 1)
                return
            }
        }

    }


    getAreaCss(obj: JAreaType) {
        let p = this.getAreaPos(obj)
        let css = {
            left: p.startX + 'px',
            top: p.startY + 'px',
            width: (p.endX - p.startX) + 'px',
            height: (p.endY - p.startY) + 'px',
            "background-color": obj.color
        }
        return css
    }

    getAreaPos(obj: JAreaType) {
        let startX = mediaStore.divFloatW * obj.startXPer + obj.startX
        let startY = mediaStore.divFloatH * obj.startYPer + obj.startY
        let endX = mediaStore.divFloatW * obj.endXPer + obj.endX
        let endY = mediaStore.divFloatH * obj.endYPer + obj.endY
        return { startX, startY, endX, endY }
    }

    getClockArea(x: number, y: number) {
        for (let i = 0; i < mediaStore.areaTouch.length; i++) {
            let child = mediaStore.areaTouch[i]
            let p = this.getAreaPos(child)
            if (x < p.startX || y < p.startY) {
                continue
            }
            if (x > p.endX || y > p.endY) {
                continue
            }
            return child
        }
        return undefined
    }

    setClickArea(x: number, y: number, otherFuns?: {
        setNext?: () => void
        setPrev?: () => void
    }) {
        let area = this.getClockArea(x, y)
        if (!area) {
            return
        }
        if (area.type == "fileManager") {
            store.displayFileManager = true
        }
        else if (area.type == "option") {
            store.displayOPPanel = true
        }
        else if (area.type == "progressBar") {
            store.displayBottomBar = true
        }
        else if (area.type == "next" && otherFuns?.setNext) {
            otherFuns.setNext()
        }
        else if (area.type == "prev" && otherFuns?.setPrev) {
            otherFuns.setPrev()
        }
    }

}

export const jaction = new JAction()