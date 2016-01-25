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
  text: {type: String, default: ''},

  // counts
  views: {type: Number, default: 0},
  saves: {type: Number, default: 0}

});

// statics
storySchema.statics.addContribution = function (storyId, username, text, userId) {
  this.findById(storyId, function (err, story) {
    if (err) console.log('err:', err);
    story.orderedContributions.push({username: username, text: text});
    story.contributors.addToSet(userId);
    story.text = story.text + '\n\n' + text;
    story.save(function (err) {if (err) console.log('err:', err)});
  });
};

storySchema.statics.getStoryText = function (storyId, success, fail) {
  this.findById(storyId, function (err, story) {
    if (err) console.log('err:', err);
    console.log('story text:', story.text);
    if (story !== null) {
      success(story.text);
    } else {
      fail();
    }
  });
}

// create and export the story model
module.exports = mongoose.model('Story', storySchema);
