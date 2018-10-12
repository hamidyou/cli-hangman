const Letter = require('./letter')
const k = require('kyanite/dist/kyanite')
const letter = x => new Letter(x)

// Contains a constructor, Word that depends on the Letter constructor.This is used to create an object representing the current word the user is attempting to guess.That means the constructor should define:

// An array of new Letter objects representing the letters of the underlying word
// A function that returns a string representing the word.This should call the function on each letter object(the first function defined in Letter.js) that displays the character or an underscore and concatenate those together.
// A function that takes a character as an argument and calls the guess function on each letter object(the second function defined in Letter.js)

function Word (word) {
  this.word = k.compose(k.map(x => letter(x)), k.split(''), word)
  this.wordString = x => k.reduce((acc, char) => acc + char + ' ', '', k.map(x => x.guessedFn(), x))
  this.checkLetter = (a, char) => k.map(x => x.checkFn(char), a)
}

module.exports = Word

// const a = new Word('hello')
// a.word[0].checkFn('h')
// // a.checkLetter(a.word, 'e')
// // console.log(a.word[0])
// // console.log(a.word[0].guessedFn())
// // console.log(a.word[0].bool)
// // console.log(a.word[0])
// console.log(a.wordString(a.word))
