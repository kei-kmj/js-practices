const command = require('commander')
const Enquirer = require('enquirer')
const util = require('util')

class Memos {
  dbAccessor () {
    const sqlite3 = require('sqlite3').verbose()
    return new sqlite3.Database('memo.sqlite')
  }

  list () {
    const db = this.dbAccessor()
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

  async show () {
    const db = this.dbAccessor()
    memos = []
    const selectValue = function () {
      return new Promise((resolve, reject) => {
        db.all('select * from memos', (err, rows) => {
          if (err) return reject(err)
          resolve(rows)
        })
      })
    }
    selectValue().then(rows => {
      rows.forEach(row => {
        memos.push(row.id + ':' + row.content.split('\n')[0])
      })
      return memos
    }).then(async (data) => {
      const questionShow = {
        type: 'select',
        name: 'show',
        message: '確認するメモを選んでください',
        choices: data.concat('確認をやめる')
      }
      const answer = await Enquirer.prompt(questionShow)
      const db = this.dbAccessor()
      db.all('SELECT id, content from memos WHERE id = ?', answer.show.split(':')[0], (err, rows) => {
        if (err) {
          console.log(err)
          return
        }
        rows.forEach((row) => {
          console.log(row.content)
        })
      })
      if (answer.show === '確認をやめる') {
        console.log('処理を中止しました')
      }
    })
  }

  create () {
    const db = this.dbAccessor()
    db.run(`CREATE TABLE IF NOT EXISTS memos
            (
                id      INTEGER PRIMARY KEY,
                content TEXT NOT NULL)`)

    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    let newMemo = ''
    console.log('新しいメモを作成します' + '\n' +
        '(Enter入力後にControl+Dで登録、中止する場合はControl+C)')
    process.stdin.on('data', function (chunk) {
      newMemo += chunk
    })

    process.stdin.on('end', async function () {
      const statement = db.prepare('INSERT INTO memos (content) VALUES(?)')
      await util.promisify(statement.run.bind(statement))(newMemo)
      if (newMemo !== []) {
        console.log('メモを登録しました')
      }
    })
  }

  async destroy () {
    const db = this.dbAccessor()
    memos = []
    const selectValue = function () {
      return new Promise((resolve, reject) => {
        db.all('select * from memos', (err, rows) => {
          if (err) return reject(err)
          resolve(rows)
        })
      })
    }
    selectValue().then(rows => {
      rows.forEach(row => {
        memos.push(row.id + ':' + row.content.split('\n')[0])
      })
      return memos
    }).then(async (data) => {
      const questionDestroy = {
        type: 'select',
        name: 'destroy',
        message: '削除するメモを選んでください',
        choices: data.concat('削除をやめる')
      }
      const answer = await Enquirer.prompt(questionDestroy)
      const dbRun = util.promisify(db.run.bind(db))
      if (answer.destroy === '削除をやめる') {
        console.log('処理を中止しました')
      } else {
        console.log(`${answer.destroy}を削除しました`)
      }
      dbRun('DELETE FROM memos WHERE id = ?', answer.destroy.split(':')[0])
    })
  }
}

let memos = new Memos()
command
  .option('-l, --list')
  .option('-r, --read')
  .option('-d, --destroy')

command.parse(process.argv)

const options = command.opts()

if (options.list) {
  memos.list()
} else if (options.read) {
  memos.show()
} else if (options.destroy) {
  memos.destroy()
} else {
  memos.create()
}
