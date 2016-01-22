var mongoose = require('mongoose');

// schema for the story model
var storySchema = mongoose.Schema({

  title: String,
  isFinished: Boolean,
  associatedRoomId: String,
  // dateStamp automatically handled by mongoose
  constributorIds: [String],
  orderedContributions: [{userId: String, text: String}]

});


// methods
// add contribution to the story
storySchema.methods.addContribution = function (userId, text) {
  this.contributorIds.push(userId);
  this.contributions.push({'userId': userId, 'text': text});
  this.save();
}

// create and export the story model
module.exports = mongoose.model('Story', storySchema);
