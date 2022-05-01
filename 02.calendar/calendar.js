const luxon = require('luxon')

const firstDay = luxon.DateTime.fromObject({
  year: 2022,
  month: 5,
  day: 1
})

const lastDay = firstDay.endOf('month')

printHeader()

for (let date = firstDay.day; date <= lastDay.day; date++) {
  const currentDate = firstDay.plus({ day: date - 1 })

  formatDate(date)
  if (currentDate.weekdayShort === 'Sat') {
    console.log(String(date))
  } else {
    process.stdout.write(String(date))
  }
}
console.log('\n')

function printHeader () {
  console.log('      ' + firstDay.year + '年' + firstDay.month + '月')
  console.log(' 日 月 火 水 木 金 土')
  if (firstDay.weekdayShort !== 'Sun') {
    process.stdout.write(String(' ').repeat(firstDay.weekday * 3))
  }
}

function formatDate (date) {
  if (date < 10) {
    process.stdout.write(String('  '))
  } else {
    process.stdout.write(String(' '))
  }
}
