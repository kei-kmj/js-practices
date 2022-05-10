const command = require("commander")
const Enquirer = require('enquirer')

class DBAccessor {
  static load() {
    const sqlite3 = require('sqlite3').verbose()
    const db = new sqlite3.Database('memo.sqlite')
    db.all('SELECT id, content from memos', (err, rows) => {
      console.log(Object.values(rows))
      return Object.values(rows)
    })
  }
}

class Memos {

  index() {

    (async () => {
          const menu = ['とんかつ', 'ハンバーグ', 'からあげ', 'カレーライス', '生姜焼き']
          const question = {
            type: 'select',
            name: 'favorite',
            choices: menu
          }
          const answer = await Enquirer.prompt(question)
          console.log(`${answer.favorite}？`)
        }
    )()
  }

  show() {
    console.log('詳細を表示します')
  }

  create() {
    console.log('新規作成します')
  }

  destroy() {
    console.log('削除します')
  }
}

DBAccessor.load()
const memos = new Memos()


command
    .option('-l, --lines')
    .option('-r, --read')
    .option('-d, --destroy')

command.parse(process.argv);

const options = command.opts();
if (options.lines) {
  memos.index()
} else if (options.read) {
  memos.show()
} else if (options.destroy) {
  memos.destroy()
} else if (options.args === undefined) {
  memos.create()
}
