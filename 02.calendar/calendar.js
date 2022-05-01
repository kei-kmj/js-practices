const luxon = require('luxon')
const today = luxon.DateTime.now()
const argv = require('minimist')(process.argv.slice(2))

const firstDay = luxon.DateTime.fromObject({
  year: argv.y = (typeof argv.y !== 'undefined') ? argv.y : today.year,
  month: argv.m = (typeof argv.m !== 'undefined') ? argv.m : today.month,
  day: 1
})

const lastDay = firstDay.endOf('month')

function main () {
  printHeader()

  for (let date = firstDay.day; date <= lastDay.day; date++) {
    const currentDate = firstDay.plus({ day: date - 1 })

    if (currentDate.weekdayShort === 'Sat') {
      console.log(String(date).padStart(3, ' '))
    } else {
      process.stdout.write(String(date).padStart(3, ' '))
    }
  }
  if (lastDay.weekdayShort !== 'Sat') {
    process.stdout.write('\n')
  }
}

function printHeader () {
  console.log('      ' + firstDay.year + '年 ' + firstDay.month + '月')
  console.log(' 日 月 火 水 木 金 土')
  if (firstDay.weekdayShort !== 'Sun') {
    process.stdout.write(String(' ').repeat(firstDay.weekday * 3))
  }
}

main()
