// project-wide helper functions

module.exports = {

  // safely attempt to get the first word of some text;
  // returns the same object if it is not of type String
  safeGetFirstWord: function (text) {
    if (typeof text === 'string') {
      return text.split(' ')[0];
    } else {
      return text;
    }
  },

  genericErrCallback: function (err) {
    if (err) {
      console.log(err);
    }
  }

}
