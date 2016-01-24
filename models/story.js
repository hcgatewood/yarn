var mongoose = require('mongoose');

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

  // counts
  views: {type: Number, default: 0},
  saves: {type: Number, default: 0}

});

// statics
storySchema.statics.addContribution = function (storyId, username, text) {
  this.findOneAndUpdate(
    {_id: storyId},
    {$push:
      {orderedContributions: {username: username, text: text}}
    },
    function (err) {if (err) console.log(err)}
  );
}

// create and export the story model
module.exports = mongoose.model('Story', storySchema);
