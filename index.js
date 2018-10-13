// load in dependencies
const Word = require('./word')
const wordArray = require('./wordArray')
const { concat, includes, compose, curry } = require('kyanite/dist/kyanite')
const inquirer = require('inquirer')

// object to hold mutatable variables
const state = {
  selectedWord: {},
  guesses: 9,
  guessedLetters: [],
  usedWords: [],
  answer: ''
}

// object of functions to call mutated variables
const getters = {
  getGuesses: x => x.guesses,
  getGuessedLetters: x => x.guessedLetters.slice(),
  getUsedWords: x => x.usedWords.slice(),
  getSelectedWord: x => x.selectedWord,
  getAnswer: x => x.answer
}

// object of functions to set mutated variables
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

// select a random word for the word Arrar and return that word
const selectedWord = arr => {
  const rand = Math.floor(Math.random() * 2045)
  const w = arr[rand]
  mutations.setAnswer(state, w)
  return w
}

// verify that the selected word hasn't been used yet in the current game
const verify = curry((arr1, arr2, str) => includes(str, arr1) ? selectedWord(arr2) : mutations.setSelectedWord(state, str))

// function to combine previous 2 functions to provide the word being used
const chooseWord = (arr, st) => compose(verify(getters.getUsedWords(st), arr), selectedWord, arr)

// function to reset the mutated variables for the next game
const resetState = () => {
  state.answer = ''
  state.guessedLetters = []
  state.guesses = 9
  state.selectedWord = {}
}

// function to check if letter is one of the characters from the Word object...checkLetter() brought in from word.js
const checkChar = (obj, char) => obj.checkLetter(obj.word, char)

// function to run checkChar AND change mutatable variables based on the result
const checkLetter = (obj, char, st) => {
  checkChar(obj, char)
  if (!includes(char, getters.getAnswer(state))) {
    mutations.setGuesses(st)
    console.log('INCORRECT')
  } else {
    console.log('CORRECT')
  }
  mutations.setGuessedLetters(st, char)
}

const separator = '\n--------------------------------------------------------------\n'

const print = x => {
  console.log(
    separator +
    x.wordString(x.word) + '\n\n' +
    'You have ' + getters.getGuesses(state) + ' guesses remaining.' + '\n\n' +
    'Guessed letters: ' + getters.getGuessedLetters(state) +
    separator
  )
}

// function to start new game
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
        chooseWord(x, state)
        ask(getters.getSelectedWord(state))
      } else {
        console.log('Goodbye!')
      }
    })
}

// function containing the logic for game play
const ask = x => {
  inquirer
    .prompt([
      {
        type: 'input',
        message: 'Choose a letter',
        name: 'choice',
        // validate the user's response to make sure it is a letter, only 1 letter, and hasn't been guessed yet
        filter: input => {
          return new Promise((resolve, reject) => {
            const regex = /[a-z]/i
            if (regex.test(input)) {
              resolve(input)
            } else {
              const err1 = new Error('You entered an invalid character. Please select a letter from a - z.')
              reject(err1)
            }
          })
            .then(input => {
              return new Promise((resolve, reject) => {
                if (input.length <= 1) {
                  resolve(input)
                } else {
                  const err2 = new Error('You entered too many characters. Please select only one letter at a time.')
                  reject(err2)
                }
              })
            })
            .then(input => {
              return new Promise((resolve, reject) => {
                if (!includes(input.toLowerCase(), getters.getGuessedLetters(state))) {
                  resolve(input.toLowerCase())
                } else {
                  const err3 = new Error('You have already guessed that letter. Please guess another letter.')
                  reject(err3)
                }
              })
            })
        }
      }
    ])
    .then(function (answers) {
      checkLetter(x, answers.choice, state)

      // print the results to the terminal
      print(x)

      // check to see if game should continue, if not, ask if the user would like to play again
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

// RUN THE GAME
chooseWord(wordArray, state)
print(getters.getSelectedWord(state))
ask(getters.getSelectedWord(state))
