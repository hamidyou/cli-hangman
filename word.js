const Letter = require('./letter')
const k = require('kyanite/dist/kyanite')
const letter = x => new Letter(x)

function Word (word) {
  this.word = k.compose(k.map(x => letter(x)), k.split(''), word)
  this.wordString = x => k.reduce((acc, char) => acc + char + ' ', '', k.map(x => x.guessedFn(), x))
  this.checkLetter = (a, char) => k.map(x => x.checkFn(char), a)
}

module.exports = Word
