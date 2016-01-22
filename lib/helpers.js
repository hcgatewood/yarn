// Project-wide helper functions

module.exports = {

  // Safely attempt to get the first word of some text;
  // returns the same object if it is not of type String
  safeGetFirstWord: function (text) {
    if (typeof text === 'string') {
      return text.split(' ')[0];
    } else {
      return text;
    }
  }

}
