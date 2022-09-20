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
  printBody()
  printFooter()
}

function printHeader () {
  console.log('      ' + firstDay.month + '月 ' + firstDay.year)
  console.log(' 日 月 火 水 木 金 土')
  if (firstDay.weekdayShort !== 'Sun') {
    process.stdout.write(String(' ').repeat(firstDay.weekday * 3))
  }
}

function printBody () {
  for (let date = firstDay.day; date <= lastDay.day; date++) {
    const currentDate = firstDay.plus({ day: date - 1 })

    process.stdout.write(String(date).padStart(3, ' '))
    if (currentDate.weekdayShort === 'Sat') {
      process.stdout.write('\n')
    }
  }
}

function printFooter () {
  if (lastDay.weekdayShort !== 'Sat') {
    process.stdout.write('\n')
  }
}

main()
