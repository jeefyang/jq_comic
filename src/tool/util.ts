import { sha1 } from "js-sha1"
import { JFileDisplayType, ZipDataType } from "../type"
import { MiddleFileType } from "../media"
import path from "path-browserify"

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

export function get16To32(hex: string) {
    let str = ""
    let newStr = ""
    for (let i = 0; i < hex.length; i++) {
        str += parseInt(hex[i], 16).toString(2)
    }
    for (let i = 0; i < str.length; i += 5) {
        newStr += parseInt(str.slice(i, i + 5), 2).toString(32)
    }
    return newStr
}


export function getThumHexName(inputFile: string, key: string) {
    let hash = sha1.create()
    hash.update(inputFile)
    let a = hash.hex()
    let hex32 = get16To32(a)
    return `${key}_${hex32}`
}

export function sortABByName(a: ZipDataType, b: ZipDataType, a1?: JFileDisplayType, b1?: JFileDisplayType, a2?: MiddleFileType, b2?: MiddleFileType): -1 | 0 | 1 {
    let alist: string[] = []
    let blist: string[] = []
    if (a && b) {
        alist = a.data.name.split(path.sep)
        blist = b.data.name.split(path.sep)
    }
    else if (a1 && b1) {
        alist = a1.name.split(path.sep)
        blist = b1.name.split(path.sep)
    }
    else if (a2 && b2) {
        alist = a2.name.split(path.sep)
        blist = b2.name.split(path.sep)
    }
    let len = alist.length > blist.length ? alist.length : blist.length
    for (let i = 0; i < len; i++) {
        if (!alist[i] && blist[i]) {
            return 1
        }
        else if (alist[i] && !blist[i]) {
            return -1
        }
        else if (alist[i] > blist[i]) {
            return 1
        }
        else if (alist[i] < blist[i]) {
            return -1
        }
    }
    return 1
}

export function sortABBySize(a: ZipDataType, b: ZipDataType, a1?: JFileDisplayType, b1?: JFileDisplayType, a2?: MiddleFileType, b2?: MiddleFileType): -1 | 0 | 1 {
    // if (!a.data.size || !b.data.size) {
    //         let alist = a.data.name.split(path.sep)
    //         let blist = b.data.name.split(path.sep)
    //         let len = alist.length > blist.length ? alist.length : blist.length
    //         for (let i = 0; i < len; i++) {
    //             if (!alist[i] && blist[i]) {
    //                 return 1
    //             }
    //             else if (alist[i] && !blist[i]) {
    //                 return -1
    //             }
    //             else if (alist[i] > blist[i]) {
    //                 return 1
    //             }
    //             else if (alist[i] < blist[i]) {
    //                 return -1
    //             }
    //         }
    //         return 1
    //     }
    //     return a.data.size > b.data.size ? 1 : -1
    if (a && b) {
        if (a.data.size == b.data.size) {
            return sortABByName(a, b)
        }
        return a.data.size > b.data.size ? 1 : -1
    }
    if (a1 && b1) {
        if (a1.size == b1.size) {
            return sortABByName(undefined, undefined, a1, b1)
        }
        return a1.size > b1.size ? 1 : -1
    }
    if (a2 && b2) {
        if (a2.size == b2.size) {
            return sortABByName(undefined, undefined, undefined, undefined, a2, b2)
        }
        return a2.size > b2.size ? 1 : -1
    }
}

export function sortABByDate(a: ZipDataType, b: ZipDataType, a1?: JFileDisplayType, b1?: JFileDisplayType, a2?: MiddleFileType, b2?: MiddleFileType): -1 | 0 | 1 {
    if (a && b) {
        if (a.data.time == b.data.time) {
            return sortABByName(a, b)
        }
        return a.data.time > b.data.time ? 1 : -1
    }
    if (a1 && b1) {
        if (a1.mtime == b1.mtime) {
            return sortABByName(undefined, undefined, a1, b1)
        }
        return a1.mtime > b1.mtime ? 1 : -1
    }
    if (a2 && b2) {
        if (a2.time == b2.time) {
            return sortABByName(undefined, undefined, undefined, undefined, a2, b2)
        }
        return a2.time > b2.time ? 1 : -1
    }
}

export function sortABByNum(a: ZipDataType, b: ZipDataType, a1?: JFileDisplayType, b1?: JFileDisplayType, a2?: MiddleFileType, b2?: MiddleFileType): -1 | 0 | 1 {
    let alist: string[] = []
    let blist: string[] = []
    if (a && b) {
        alist = a.data.name.split(path.sep)
        blist = b.data.name.split(path.sep)
    }
    else if (a1 && b1) {
        alist = a1.name.split(path.sep)
        blist = b1.name.split(path.sep)
    }
    else if (a2 && b2) {
        alist = a2.name.split(path.sep)
        blist = b2.name.split(path.sep)
    }
    let len = alist.length > blist.length ? alist.length : blist.length
    for (let i = 0; i < len; i++) {
        if (!alist[i] && blist[i]) {
            return 1
        }
        else if (alist[i] && !blist[i]) {
            return -1
        }
        let an: string[] = alist[i].match(/\d+/g) || []
        let bn: string[] = blist[i].match(/\d+/g) || []
        let numlen = an.length > bn.length ? an.length : bn.length
        for (let j = 0; j < numlen; j++) {
            if (an[j] == undefined && bn[j] != undefined) {
                return 1
            }
            else if (an[j] != undefined && bn[j] == undefined) {
                return -1
            }
            if (Number(an[j]) > Number(bn[j])) {
                return 1
            }
            else if (Number(an[j]) < Number(bn[j])) {
                return -1
            }
        }

    }
    return 1
}