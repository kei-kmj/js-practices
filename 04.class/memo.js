const command = require('commander')
const Enquirer = require('enquirer')
const sqlite3 = require('sqlite3').verbose()


class Memos {
  static #dbAccessor () {
    return new sqlite3.Database('memo.sqlite')
  }

  build () {
    Memos.#dbAccessor().run(`CREATE TABLE IF NOT EXISTS memos
                             (
                                 id      INTEGER PRIMARY KEY,
                                 content TEXT NOT NULL
                             )`, () => {
      Memos.#dbAccessor().get('SELECT COUNT (*) FROM memos', (err, count) => {
        if (err) {
          console.log(err)
        }
        if (count['COUNT (*)'] === 0) {
          console.log('メモはまだありません')
          this.create()
        }
      })
    })
  }

  list () {
    Memos.#dbAccessor().all('SELECT * FROM memos', (err, rows) => {
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
    const process = 'show'
    const processName = '確認'

    Memos.#dbAccessor().all('SELECT * FROM memos', async (err, rows) => {
      if (err) {
        console.log(err)
        return
      }
      rows.forEach(row => {
        selectionItem.push(`${row.id}:${row.content.split('\n')[0]}`)
      })

      const selected = Memos.#letChoose(process, processName, selectionItem)
      const answer = await Enquirer.prompt(selected)
      mainProcessOfShow(answer)

    })

    // show {
    //   const foo = function(){共通処理}
    //
    //   mainProcess(foo)
    //
    // }
    //

    function mainProcessOfShow (answer) {
      Memos.#dbAccessor().all('SELECT id, content FROM memos WHERE id = ?', answer.show.split(':')[0], (err, rows) => {
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

  create () {
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    let newMemo = ''
    console.log('新しいメモを作成します\n (Enter入力後にControl+Dで登録、中止する場合はControl+C)')
    process.stdin.on('data', function (chunk) {
      newMemo += chunk
    })
    process.stdin.on('end', function () {
      Memos.#dbAccessor().prepare('INSERT INTO memos (content) VALUES(?)').run(newMemo)
      if (newMemo !== '') {
        console.log('メモを登録しました')
      }
    })
  }

  destroy () {
    const selectionItem = []
    const db = Memos.#dbAccessor()
    const process = 'destroy'
    const processName = '削除'

    db.all('SELECT * FROM memos', async (err, rows) => {
      if (err) {
        console.log(err)
        return
      }
      rows.forEach(row => {
        selectionItem.push(`${row.id}:${row.content.split('\n')[0]}`)
      })
      const selected = Memos.#letChoose(process, processName, selectionItem)
      const answer = await Enquirer.prompt(selected)
      mainProcessOfDestroy(answer)
    })

    function mainProcessOfDestroy (answer) {
      if (answer.destroy === '削除をやめる') {
        console.log('処理を中止しました')
      } else {
        console.log(`${answer.destroy}を削除しました`)
        db.run('DELETE FROM memos WHERE id = ?', answer.destroy.split(':')[0])
      }
    }
  }

  static #letChoose (process, processName, selectionItem) {
    return {
      type: 'select',
      name: process,
      message: `${processName}するメモを選んでください`,
      choices: selectionItem.concat(`${processName}をやめる`)
    }
  }
}


command
  .option('-l, --list')
  .option('-r, --read')
  .option('-d, --destroy')

command.parse(process.argv)

const options = command.opts()

const memos = new Memos()

new Promise((resolve => {
  memos.build()
  resolve()
})).then(() =>{
  switchOperation()
})

function switchOperation () {
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
