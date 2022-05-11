const command = require("commander")
const Enquirer = require('enquirer')
const util = require("util");


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
    const show_list = this.memos().concat(['やめる'])
    const question_show = {
      type: 'select',
      name: 'show',
      message: '確認するメモを選んでください',
      choices: show_list
    }
    if (question_show.choices === 'やめる') {
      exit
    } else {
      const answer = await Enquirer.prompt(question_show)
      const db = DBAccessor()
      db.all('SELECT id, content from memos WHERE id = ?',answer.show, (err, rows) => {
        if (err) {
          console.log(err)
          return
        }
        rows.forEach((row) => {
          console.log(row.content)
        })
      })
    }
  }

  async create() {
    const db = DBAccessor()
    //const statement = db.prepare('INSERT INTO memos (content) VALUES(?)')
    //await util.promisify(statement.run.bind(statement))('太田　モアレ')
    const statement = db.prepare('INSERT INTO memos VALUES(?,?)')
    await util.promisify(statement.run.bind(statement))(8, '池田理代子\nベルサイユのばら')
  }

  async destroy() {
    const destroy_list = this.memos().concat(['削除をやめる'])
    const question_destroy = {
      type: 'select',
      name: 'destroy',
      message: '削除するメモを選んでください',
      choices: destroy_list
    }
    if (question_destroy.choices === '削除をやめる') {
      exit
    } else {
      const answer = await Enquirer.prompt(question_destroy)
      const db = DBAccessor()
      const dbRun = util.promisify(db.run.bind(db))
      await dbRun('DELETE FROM memos WHERE id = ?', answer.destroy)
    }
  }

  memos() {
    return ['9', '10']
  }
}


const memos = new Memos()
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
