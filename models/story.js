var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// schema for the story model
var storySchema = new mongoose.Schema({

  title: {type: String, default: 'Untitled'},
  originRoom: String,
  isFinished: {type: Boolean, default: false},
  // dateStamp automatically handled by mongoose
  orderedContributions: [{
    //username: {type: Schema.Types.ObjectId, ref: 'User'},
    username: String,
    text: String
  }],
  contributors: [String],
  text: {type: String, default: ''},

  // counts
  views: {type: Number, default: 0},
  saves: {type: Number, default: 0}

});

// virtuals
storySchema.virtual('firstChars').get(function () {
  return this.text.split(/\s+/).slice(0, 10).join(' ') + '...';
});

// statics
storySchema.statics.published = function (userId, callback) {
  this
    .find({contributors: {$in: [userId]}})
    .exec(function (err, contributed) {
      callback(contributed);
    });
}

// find most recent stories
storySchema.statics.mostRecentStories = function (callback) {
  this.where('text').ne('').where('isFinished').equals(true).sort('-date').limit(10).exec(function (err, stories) {
    callback(stories);
  });
}
storySchema.statics.addContribution = function (storyId, username, text, userId) {
  this.findById(storyId, function (err, story) {
    if (err) console.log('err:', err);
    story.orderedContributions.push({username: username, text: text});
    story.contributors.addToSet(userId);
    story.text = story.text + '\n\n' + text;
    story.save(function (err) {if (err) console.log('err:', err)});
  });
};
storySchema.methods.addContribution = function (username, text, userId) {
  this.orderedContributions.push({username: username, text: text});
  this.contributors.addToSet(userId);
  this.text = this.text + '\n\n' + text;
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
