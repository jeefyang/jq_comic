import anime from "animejs"
import { imgStore } from "../imgStore"

class JDisplayAnime {

    div: HTMLElement
    duration: number = 1000

    init(div: HTMLElement) {
        this.div = div
    }

    update() {
        // if (!this.div) {
        //     console.warn("元素未初始化")
        //     return
        // }
        // anime({
        //     targets: this.div,
        //     translateX: imgStore.domTransX,
        //     translateY: imgStore.domTransY,
        //     scale: imgStore.domScale,
        //     duration: this.duration,
        //     easing: "linear"
        // })
    }

    updateByNoAnime() {
        if (!this.div) {
            console.warn("元素未初始化")
            return
        }
        // this.div.style
    }

}

export const jDisplayAnime = new JDisplayAnime()