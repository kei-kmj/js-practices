printHeader()
for (let date = 1; date <= 31; date++) {
  format(date)
  if (date % 7 === 0) {
    console.log(String(date))
  } else {
    process.stdout.write(String(date))
  }
}
console.log('\n')

function printHeader () {
  console.log('  　　2022年 5月')
  console.log(' 日 月 火 水 木 金 土')
}

function format (date) {
  if (date < 10) {
    process.stdout.write(String('  '))
  } else {
    process.stdout.write(String(' '))
  }
}
