

/** 克隆对象 */
export function clone<T>(obj: T): T {

    if (typeof obj == "object") {
        if (Array.isArray(obj)) {
            let a: any[] = []
            for (let i = 0; i < obj.length; i++) {
                a.push(clone(obj[i]))
            }
            //@ts-ignore
            return a
        }
        let a: any = {}
        for (let key in obj) {
            a[key] = clone(obj[key])
        }
        return a
    }
    else {
        return obj
    }
}

/** 快速克隆单层对象(仅适合单层对象,如果不确定,请不要使用) */
export function cloneAssign<T>(obj: T): T {
    return Object.assign({}, obj)
}

export function everyBetween<T>(arr: T[], target: number, between: number[], cb: (a: T, ci: number) => void) {
    let len = arr.length - 1
    for (let i = target - between[0]; i < target + between[1]; i++) {
        if (i < 0) {
            continue
        }
        if (i > len) {
            break
        }
        cb(arr[i], i)
    }

}