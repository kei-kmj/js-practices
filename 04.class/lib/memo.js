const command = require("commander")
const Enquirer = require('enquirer')
const util = require("util");

class DBAccessor {
  static load() {

  }
}

class Memos {
  index() {
    const sqlite3 = require('sqlite3').verbose()
    const db = new sqlite3.Database('memo.sqlite')

    db.all('SELECT id, content from memos', (err, rows) => {
      if (err) {
        console.log(err)
        return
      }
      rows.forEach((row) => {
        console.log(row.id + ' : ' + row.content.split('\n')[0])
      })
    })
  }

  show() {
    console.log('詳細を表示します')
  }

  async create() {
    const sqlite3 = require('sqlite3').verbose()
    const db = new sqlite3.Database('memo.sqlite')
    const statement = db.prepare('INSERT INTO memos (content) VALUES(?)')
    await util.promisify(statement.run.bind(statement))('みなもと　太郎')
  }

  async destroy() {
    const sqlite3 = require('sqlite3').verbose()
    const db = new sqlite3.Database('memo.sqlite')
    const dbRun = util.promisify(db.run.bind(db))
    await dbRun('DELETE FROM memos WHERE id = ?', 9)

  }
}

DBAccessor.load()

const memos = new Memos()
command
    .option('-l, --lines')
    .option('-r, --read')
    .option('-d, --destroy')

command.parse(process.argv)

const options = command.opts()

if (options.lines) {memos.index()
} else if (options.read) {
  memos.show()
} else if (options.destroy) {
  memos.destroy()
} else if (options.args === undefined) {
  memos.create()
}
