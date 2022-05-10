class DBAccessor {
  static load() {
    console.log('データベースにアクセスするクラスです')
  }
}

class Memos {
  index() {
    console.log('一覧を表示します')
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

const command = require("commander")
command
    .option('-l, --index')
    .option('-r, --read')
    .option('-d, --destroy')

command.parse(process.argv);

const options = command.opts();
if (options.index) {
  memos.index()
} else if (options.read) {
  memos.show()
} else if (options.destroy) {
  memos.destroy()
} else if (options.args === undefined) {
  memos.create()
}
