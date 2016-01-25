var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// schema for the story model
var storySchema = new mongoose.Schema({

  title: {type: String, default: 'Untitled'},
  isFinished: {type: Boolean, default: false},
  // dateStamp automatically handled by mongoose
  orderedContributions: [{
    //username: {type: Schema.Types.ObjectId, ref: 'User'},
    username: String,
    text: String
  }],
  contributors: [{type: Schema.Types.ObjectId, ref: 'User'}],

  // counts
  views: {type: Number, default: 0},
  saves: {type: Number, default: 0}

});

// statics
storySchema.statics.addContribution = function (storyId, username, text, userId) {
  this.findById(storyId, function (err, story) {
    story.orderedContributions.push({username: username, text: text});
    story.contributors.push(userId);
    story.save(function (err) {if (err) console.log('err:', err)});
  });
};

// create and export the story model
module.exports = mongoose.model('Story', storySchema);
