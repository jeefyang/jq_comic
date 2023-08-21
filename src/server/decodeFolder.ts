import path from "path"
import { JFileDisplayType, JFileFormatType, JFolderDisplayType } from "../type"
import fs from "fs"

export function decodeFolder(baseUrl: string, url: string) {
    let exNameList: JFileFormatType[] = [
        "zip",
        "gif",
        "bmp",
        "jpg",
        "jpeg",
        "png",
        "apng",
        "webp",
        "mp4",
        "webm",
    ]
    let newUrl = path.join(baseUrl, url)
    let stat: fs.Stats
    try {
        stat = fs.statSync(newUrl)
        if (!stat || !stat.isDirectory()) {
            return
        }
    }
    catch (e) {
        return
    }
    let files = fs.readdirSync(newUrl)

    let obj: JFolderDisplayType = {
        files: [],
        folders: [],
        url: url,
        name: newUrl.split(path.sep).reverse()[0]
    }
    for (let i = 0; i < files.length; i++) {
        let file = files[i]
        let fileUrl = path.join(newUrl, file)
        let stat = fs.statSync(fileUrl)
        if (stat.isDirectory()) {
            let child: JFolderDisplayType = {
                name: file, url: path.join(url, file), mtime: stat.mtimeMs, atime: stat.atimeMs, btime: stat.birthtimeMs, ctime: stat.ctimeMs, size: stat.size
            }
            obj.folders.push(child)
            continue
        }

        let exName = path.extname(file)
        exName = exName.replace(".", "")
        exName = exName.toLocaleLowerCase()
        if (exNameList.findIndex(c => c == exName) == -1) {
            continue
        }
        stat.blksize

        let child: JFileDisplayType = {
            name: file, exName: exName, mtime: stat.mtimeMs, atime: stat.atimeMs, btime: stat.birthtimeMs, ctime: stat.ctimeMs, size: stat.size
        }
        obj.files.push(child)
    }
    return obj

}