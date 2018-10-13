// create Letter constructor
function Letter (char) {
  this.char = char
  this.bool = false
  this.guessedFn = () => this.bool ? this.char : '-'
  this.checkFn = x => {
    if (x === this.char) {
      this.bool = true
    }
  }
}

module.exports = Letter
