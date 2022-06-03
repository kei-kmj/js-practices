const command = require('commander')
const Enquirer = require('enquirer')
const sqlite3 = require('sqlite3').verbose()

class Memos {
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
        }
        else if (count['COUNT (*)'] === 0) {
          console.log('メモはまだありません')
          this.create()
        } else {
          switchOperation()
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
    Memos.#dbAccessor().all('SELECT * FROM memos', async (err, rows) => {
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
    process.stdin.on('end', function () {
      const statement = Memos.#dbAccessor().prepare('INSERT INTO memos (content) VALUES(?)')
      statement.run.bind(statement)(newMemo)
      if (newMemo !== '') {
        console.log('メモを登録しました')
      }
    })
  }

  destroy () {
    const selectionItem = []
    const name = 'destroy'
    const name_ja = '削除'
    const message = `${name_ja}するメッセージを選んでください`
    const choiceAdd = `${name_ja}をやめる`

    function getAnswerName (answer) {
      return answer.destroy
    }

    Memos.#dbAccessor().all('SELECT * FROM memos', async (err, rows) => {
      if (err) {
        console.log(err)
        return
      }
      rows.forEach(row => {
        selectionItem.push(`${row.id}:${row.content.split('\n')[0]}`)
      })
      const questionDestroy = this.displayQuestion(name, message, selectionItem, choiceAdd)
      const answer = await Enquirer.prompt(questionDestroy)
      const answerName = getAnswerName(answer)
      this.mainProcessOfDestroy(answerName, choiceAdd, name_ja)
    })
  }

  displayQuestion (name, message, selectionItem, choiceAdd) {
    return {
      type: 'select',
      name: name,
      message: message,
      choices: selectionItem.concat(choiceAdd)
    }
  }
  mainProcessOfDestroy (answerName, ChoiceAdd, name_ja) {
    if (answerName === ChoiceAdd) {
      console.log(`${name_ja}を中止しました`)
    } else {
      console.log(`${answerName}を${name_ja}しました`)
      Memos.#dbAccessor().run('DELETE FROM memos WHERE id = ?', answerName.split(':')[0])
    }
  }
}

const memos = new Memos()
memos.operate()

command
  .option('-l, --list')
  .option('-r, --read')
  .option('-d, --destroy')

command.parse(process.argv)

const options = command.opts()

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
