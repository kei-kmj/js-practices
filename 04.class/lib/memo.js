const command = require('commander')
const Enquirer = require('enquirer')
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('memo.sqlite')

class Memos {
  operate () {
    db.run(`CREATE TABLE IF NOT EXISTS memos
            (
                id      INTEGER PRIMARY KEY,
                content TEXT NOT NULL
            )`, () => {
      db.get('SELECT COUNT (*) FROM memos', (err, count) => {
        if (err) {
          console.log(err)
        }
        if (count['COUNT (*)'] === 0) {
          console.log('メモはまだありません')
          memos.create()
        } else {
          switchOperation()
        }
      })
    })
  }

  list () {
    db.all('SELECT id, content FROM memos', (err, rows) => {
      if (err) {
        console.log(err)
        return
      }
      rows.forEach((row) => {
        console.log(`${row.id}:${row.content.split('\n')[0]}`)
      })
    })
  }

  show () {
    const selectionItem = []
    db.all('SELECT * FROM memos', async (err, rows) => {
      if (err) {
        console.log(err)
        return
      }

      rows.forEach(row => {
        selectionItem.push(`${row.id}:${row.content.split('\n')[0]}`)
      })

      const questionShow = {
        type: 'select',
        name: 'show',
        message: '確認するメモを選んでください',
        choices: selectionItem.concat('確認をやめる')
      }

      const answer = await Enquirer.prompt(questionShow)
      if (answer.show === '確認をやめる') {
        console.log('処理を中止しました')
      } else {
        db.all('SELECT id, content FROM memos WHERE id = ?', answer.show.split(':')[0], (err, rows) => {
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

  create () {
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    let newMemo = ''
    console.log('新しいメモを作成します\n (Enter入力後にControl+Dで登録、中止する場合はControl+C)')
    process.stdin.on('data', function (chunk) {
      newMemo += chunk
    })
    process.stdin.on('end', async function () {
      const statement = db.prepare('INSERT INTO memos (content) VALUES(?)')
      statement.run.bind(statement)(newMemo)
      if (newMemo !== '') {
        console.log('メモを登録しました')
      }
    })
  }

  destroy () {
    const selectionItem = []
    db.all('SELECT * FROM memos', async (err, rows) => {
      if (err) {
        console.log(err)
        return
      }
      rows.forEach(row => {
        selectionItem.push(`${row.id}:${row.content.split('\n')[0]}`)
      })
      const questionDestroy = {
        type: 'select',
        name: 'destroy',
        message: '削除するメモを選んでください',
        choices: selectionItem.concat('削除をやめる')
      }
      const answer = await Enquirer.prompt(questionDestroy)
      const dbRun = db.run.bind(db)
      if (answer.show === '削除をやめる') {
        console.log('処理を中止しました')
      } else {
        console.log(`${answer.destroy}を削除しました`)
      }
      dbRun('DELETE FROM memos WHERE id = ?', answer.destroy.split(':')[0])
    })
  }
}

const memos = new Memos()
memos.operate()

function switchOperation () {
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
}
