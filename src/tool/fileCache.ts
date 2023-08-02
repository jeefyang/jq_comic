import { JFolderDisplayType } from "../type";
import { JserverLink } from "../tool/serverLink"
import { store } from "../store"

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
        return obj
    }
}

export let jFileCache = new JFileCache()