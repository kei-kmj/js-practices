const command = require("commander")
const Enquirer = require('enquirer')
const util = require("util");

// const {prompt} = require("enquirer");


function DBAccessor() {
  const sqlite3 = require('sqlite3').verbose()
  return new sqlite3.Database('memo.sqlite');
}

class Memos {
  index() {
    const db = DBAccessor()
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

  async show() {
    const sqlite3 = require('sqlite3').verbose()
    const db = new sqlite3.Database('memo.sqlite')
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
      const question_show = {
        type: 'select',
        name: 'show',
        message: '確認するメモを選んでください',
        choices: data.concat('確認をやめる')
      }
      if (question_show.choices === '確認をやめる') {
        exit
      } else {
        const answer = await Enquirer.prompt(question_show)
        const db = DBAccessor()
        db.all('SELECT id, content from memos WHERE id = ?', answer.show.split(':')[0], (err, rows) => {
          if (err) {
            console.log(err)
            return
          }
          rows.forEach((row) => {
            console.log(row.content)
          })
        })
      }
    })
  }

  create() {
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    let new_memo = ''
    console.log('新しいメモを作成します' +'\n' +
        '(Enter入力後にControl+Dで登録、中止する場合はControl+C)')
    process.stdin.on('data', function (chunk) {
      new_memo += chunk
    })

    process.stdin.on('end', async function () {
      const db = DBAccessor()
      const statement = db.prepare('INSERT INTO memos (content) VALUES(?)')
      await util.promisify(statement.run.bind(statement))(new_memo)

    })
  }

  async destroy() {
    const sqlite3 = require('sqlite3').verbose()
    const db = new sqlite3.Database('memo.sqlite')
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
      const question_destroy = {
        type: 'select',
        name: 'destroy',
        message: '削除するメモを選んでください',
        choices: data.concat(['削除をやめる'])
      }
      if (question_destroy.choices === '削除をやめる') {
        exit
      } else {
        const answer = await Enquirer.prompt(question_destroy)
        const db = DBAccessor()
        const dbRun = util.promisify(db.run.bind(db))
        await dbRun('DELETE FROM memos WHERE id = ?', answer.destroy.split(':')[0])
      }
    })
  }
}


let memos = new Memos()
command
    .option('-l, --lines')
    .option('-r, --read')
    .option('-d, --destroy')

command.parse(process.argv)

const options = command.opts()

if (options.lines) {
  memos.index()
} else if (options.read) {
  memos.show()
} else if (options.destroy) {
  memos.destroy()
} else if (options.args === undefined) {
  memos.create()
}
