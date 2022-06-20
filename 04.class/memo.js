const command = require('commander')
const enquirer = require('enquirer')
const sqlite3 = require('sqlite3').verbose()

class Memos {
  constructor (options) {
    this.options = options
  }

  #dbAccessor () {
    return new sqlite3.Database('memo.sqlite')
  }

  operate () {
    this.#dbAccessor().run(`CREATE TABLE IF NOT EXISTS memos
                           (
                               id      INTEGER PRIMARY KEY,
                               content TEXT NOT NULL
                           )`, () => {
      this.#dbAccessor().get('SELECT COUNT (*) FROM memos', (err, count) => {
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
        } else if (this.options.read) {
          this.#show()
        } else if (this.options.destroy) {
          this.#destroy()
        } else {
          this.#create()
        }
      })
    })
  }

  #list () {
    this.#dbAccessor().all('SELECT * FROM memos', (err, rows) => {
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

    this.#askAndGetAnswer(operation, operationName, (answer) => {
      this.#dbAccessor().all('SELECT id, content FROM memos WHERE id = ?', answer.show.split(':')[0], (err, rows) => {
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
      this.#dbAccessor().prepare('INSERT INTO memos (content) VALUES(?)').run(newMemo, (err) => {
        if (err) {
          console.log(err)
          return
        }
        console.log('メモを登録しました')
      })
    })
  }

  #destroy () {
    const operation = 'destroy'
    const operationName = '削除'

    this.#askAndGetAnswer(operation, operationName, (answer) => {
      if (answer.destroy === '削除をやめる') {
        console.log('処理を中止しました')
        return
      }

      this.#dbAccessor().run('DELETE FROM memos WHERE id = ?', answer.destroy.split(':')[0], (err) => {
        if (err) {
          console.log(err)
          return
        }
        console.log(`${answer.destroy}を削除しました`)
      })
    })
  }

  #askAndGetAnswer (operation, operationName, mainProcess) {
    this.#dbAccessor().all('SELECT * FROM memos', async (err, rows) => {
      if (err) {
        console.log(err)
        return
      }
      const selectionItem = rows.map(row => `${row.id}:${row.content.split('\n')[0]}`)
      const selected = this.#showSelection(operation, operationName, selectionItem)
      const answer = await enquirer.prompt(selected)
      mainProcess(answer)
    })
  }

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
