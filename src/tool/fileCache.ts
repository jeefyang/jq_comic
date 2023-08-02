import { JFolderDisplayType } from "../type";
import { JserverLink } from "../tool/serverLink"

class JFileCache {

    cache: { [propName: string]: JFolderDisplayType } = {}
    server: JserverLink

    constructor() {

    }

    init(server: JserverLink) {
        this.server=server
    }
}

export let jFileCache = new JFileCache()