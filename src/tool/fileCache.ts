import { JFolderDisplayType } from "../type";
import { JserverLink } from "../tool/serverLink"
import { store } from "../store"
import path from "path-browserify"

class JFileCache {

    cache: { [propName: string]: JFolderDisplayType } = {}
    server: JserverLink

    constructor() {

    }

    init(server: JserverLink) {
        this.server = server
    }

    async getFolder(url: string) {
        store.curDirUrl = url
        if (this.cache[url]) {
            return this.cache[url]
        }
        let obj = await this.server.getFolder(url)
        this.cache[url] = obj
        return obj
    }

    // async addFolderUrl(url: string) {
    //     let newUrl = path.join(store.curDirUrl, url)
    //     await this.getFolder(newUrl)
    //     return
    // }
}

export let jFileCache = new JFileCache()