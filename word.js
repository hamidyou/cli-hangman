const Letter = require('./letter')
const { compose, reduce, map, split } = require('kyanite/dist/kyanite')
const letter = x => new Letter(x)

function Word (word) {
  this.word = compose(map(x => letter(x)), split(''), word)
  this.wordString = x => reduce((acc, char) => acc + char + ' ', '', map(x => x.guessedFn(), x))
  this.checkLetter = (a, char) => map(x => x.checkFn(char), a)
}

module.exports = Word
