class DBAccessor {
  static load() {
    console.log('データベースにアクセスするクラスです')
  }
}

class Memos {
  index () {
    console.log('一覧を表示します')
  }

  show () {
    console.log('詳細を表示します')
  }

  create () {
    console.log('新規作成します')
  }

  destroy () {
    console.log('削除します')
  }
}

DBAccessor.load()
const memos = new Memos()
memos.index()
memos.create()
memos.destroy()
