import fs from 'fs'
import path from "path"
import sqlite3 from "sqlite3"

export class SqliteFactory {

    dbname: string = "data.db"
    thumDir: string = "thumbnail"
    db: sqlite3.Database
    constructor(public baseDir: string) {
        this.init()
    }

    init() {
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdirSync(this.baseDir, { "recursive": true })
        }
        let tdir = path.join(this.baseDir, this.thumDir)
        if (!fs.existsSync(tdir)) {
            fs.mkdirSync(tdir, { "recursive": true })
        }
        let sql = sqlite3.verbose()
        this.db = new sql.Database(path.join(this.baseDir, this.dbname), () => {
            this.db.run
            this.db.run(`create table if not exists thumbList(
                id int primary key not null,
                relativePath text not null,
                fileName text not null,
                mtime text not null,
                size text not null,
                isZip blob not null,
                thumbName text not null
            )`, (res, err) => {
                console.log(res, err)
                if (err) {
                    return console.log(err)
                }
                console.log("create table thumbList")
            })
        })
    }
}