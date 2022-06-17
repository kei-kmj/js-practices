const command = require('commander')
const enquirer = require('enquirer')
const sqlite3 = require('sqlite3').verbose()

class Memos {
  constructor (options) {
    this.options = options
  }

  static #dbAccessor () {
    return new sqlite3.Database('memo.sqlite')
  }

  operate () {
    Memos.#dbAccessor().run(`CREATE TABLE IF NOT EXISTS memos
                             (
                                 id      INTEGER PRIMARY KEY,
                                 content TEXT NOT NULL
                             )`, () => {
      Memos.#dbAccessor().get('SELECT COUNT (*) FROM memos', (err, count) => {
        if (err) {
          console.log(err)
          return
        }
        if (count['COUNT (*)'] === 0) {
          console.log('メモはまだありません')
          this.#create()
          return
        }
        if (this.options.list) {
          this.#list()
          return
        }
        if (this.options.read) {
          this.#show()
          return
        }
        if (this.options.destroy) {
          this.#destroy()
          return
        }
        this.#create()
      })
    })
  }

  #list () {
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

  #show () {
    const operation = 'show'
    const operationName = '確認'

    this.#askAndGetAnswer(operation, operationName,
      function (answer) {
        Memos.#dbAccessor().all('SELECT id, content FROM memos WHERE id = ?', answer.show.split(':')[0], (err, rows) => {
          if (err) {
            console.log(err)
            return
          }
          rows.forEach((row) => {
            console.log(row.content)
          })
        })
      })
  }

  #create () {
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    let newMemo = ''
    console.log('新しいメモを作成します\n (Enter入力後にControl+Dで登録、中止する場合はControl+C)')
    process.stdin.on('data', (chunk) => {
      newMemo += chunk
    })
    process.stdin.on('end', () => {
      if (newMemo === '') {
        return
      }
      Memos.#dbAccessor().prepare('INSERT INTO memos (content) VALUES(?)').run(newMemo, () => {
        console.log('メモを登録しました')
      })
    })
  }

  #destroy () {
    const operation = 'destroy'
    const operationName = '削除'

    this.#askAndGetAnswer(operation, operationName, function (answer) {
      if (answer.destroy === '削除をやめる') {
        console.log('処理を中止しました')
        return
      }

      Memos.#dbAccessor().run('DELETE FROM memos WHERE id = ?', answer.destroy.split(':')[0], () => {
        console.log(`${answer.destroy}を削除しました`)
      })
    })
  }

  #askAndGetAnswer (operation, operationName, mainProcess) {
    const selectionItem = []
    Memos.#dbAccessor().all('SELECT * FROM memos', async (err, rows) => {
      if (err) {
        console.log(err)
        return
      }
      rows.forEach(row => {
        selectionItem.push(`${row.id}:${row.content.split('\n')[0]}`)
      })
      const selected = Memos.#showSelection(operation, operationName, selectionItem)
      const answer = await enquirer.prompt(selected)
      mainProcess(answer)
    })
  }

  static
  #showSelection (operation, operationName, selectionItem) {
    return {
      type: 'select',
      name: operation,
      message: `${operationName}するメモを選んでください`,
      choices: selectionItem.concat(`${operationName}をやめる`)
    }
  }
}

command
  .option('-l, --list')
  .option('-r, --read')
  .option('-d, --destroy')

command.parse(process.argv)

const options = command.opts()

const memos = new Memos(options)
memos.operate()
