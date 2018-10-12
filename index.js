const Word = require('./word')
const wordArray = require('./wordArray')
const { concat, includes, compose, curry } = require('kyanite/dist/kyanite')
const inquirer = require('inquirer')

const state = {
  selectedWord: {},
  guesses: 9,
  guessedLetters: [],
  usedWords: [],
  answer: ''
}

const getters = {
  // Either pass state to this or access the state global up to you
  getGuesses: x => x.guesses,
  // I use slice to make SURE the guesses state is a brand new object
  // Removing the need to worry about refrence mutation
  getGuessedLetters: x => x.guessedLetters.slice(),
  getUsedWords: x => x.usedWords.slice(),
  getSelectedWord: x => x.selectedWord,
  getAnswer: x => x.answer
}

const mutations = {
  setGuesses: (cxt) => cxt.guesses--,
  setGuessedLetters: (cxt, data) => {
    cxt.guessedLetters = concat(data, cxt.guessedLetters)
  },
  setUsedWords: (cxt, data) => {
    cxt.usedWords = concat(data, cxt.usedWords)
  },
  setSelectedWord: (cxt, data) => {
    cxt.selectedWord = new Word(data)
  },
  setAnswer: (cxt, data) => {
    cxt.answer = data
  },
  resetGuesses: (cxt) => {
    cxt.guesses = 9
  }
}

const selectedWord = arr => {
  const rand = Math.floor(Math.random() * 2045)
  const w = arr[rand]
  mutations.setAnswer(state, w)
  return w
}

const verify = curry((arr1, arr2, str) => includes(str, arr1) ? selectedWord(arr2) : mutations.setSelectedWord(state, str))

const chooseWord = arr => compose(verify(getters.getUsedWords(state), arr), selectedWord, arr)

const resetState = () => {
  state.answer = ''
  state.guessedLetters = []
  state.guesses = 9
  state.selectedWord = {}
}

const playAgain = x => {
  inquirer
    .prompt([
      {
        type: 'confirm',
        message: 'Play again?',
        name: 'play'
      }
    ])
    .then(function (a) {
      if (a.play) {
        resetState()
        chooseWord(x)
        ask(getters.getSelectedWord(state))
      } else {
        console.log('Goodbye!')
      }
    })
}

const ask = x => {
  inquirer
    .prompt([
      {
        type: 'input',
        message: 'Choose a letter',
        name: 'choice'
      }
    ])
    .then(function (answers) {
      const separator = '\n--------------------------------------------------------------\n'
      const checkChar = (obj, char) => obj.checkLetter(obj.word, char)
      checkChar(x, answers.choice)
      mutations.setGuesses(state)
      mutations.setGuessedLetters(state, answers.choice)
      console.log(
        separator +
        x.wordString(x.word) + '\n\n' +
        'You have ' + getters.getGuesses(state) + ' guesses remaining.' + '\n\n' +
        'Guessed letters: ' + getters.getGuessedLetters(state) +
        separator
      )

      if (!includes('-', x.wordString(x.word))) {
        console.log('Congratulations!  You guessed the word!')
        playAgain(wordArray)
      } else if (getters.getGuesses(state) > 0) {
        ask(x)
      } else {
        console.log('Sorry, better luck next time....the word was: ' + getters.getAnswer(state))
        playAgain(wordArray)
      }
    })
}

chooseWord(wordArray)
ask(getters.getSelectedWord(state))
