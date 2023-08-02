import path from "path"
import { JFileDisplayType, JFolderDisplayType } from "../type"
import fs from "fs"

export function decodeFolder(baseUrl: string, url: string) {
    let exNameList = ["jpg", "jpeg", "bmp", "png", "webp", "apng", "gif", "mp4", "avi", "webm", "zip", "mkv"]
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
    console.log(baseUrl,url)
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
                name: file, url: path.join(url, file)
            }
            obj.folders.push(child)
            continue
        }
        let exName = path.extname(file)
        exName = exName.replace(".", "")
        exName = exName.toLocaleLowerCase()
        if (!exNameList.includes(exName)) {
            continue
        }
        let child: JFileDisplayType = {
            name: file, exName: exName
        }
        obj.files.push(child)
    }
    return obj

}