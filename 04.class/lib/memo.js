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
      db.all('SELECT id, content from memos WHERE id = ?', answer.show, (err, rows) => {
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

  create() {

    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    let new_memo = ''
    console.log('新しいメモを作成します')
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
    return ['13', '12', '11', '10']
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
