var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var helpers = require('../lib/helpers');
var Schema = mongoose.Schema;


// define the schema for our user model
var userSchema = new mongoose.Schema({

  //username: {type: String, default: 'todo'},
  recentlyViewedStories: [ {type: Schema.Types.ObjectId, ref: 'Story'} ],
  contributedStories: [ {type: Schema.Types.ObjectId, ref: 'Story'} ],
  savedStories: [ {type: Schema.Types.ObjectId, ref: 'Story'} ],
  following: [String],

  //currentStory: {type: Schema.Types.ObjectId, ref: 'Story'},

  // authentications/credentials
  local: {
    username: String,
    password: String
  },
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String
  }

});


// virtuals
// TODO: this eventually shouldn't need to be a virtual because
// we'll force new users to pick a username even if they
// log in socially
userSchema.virtual('username').get(function () {
  var username = this.local.username ||
    helpers.safeGetFirstWord(this.facebook.name) ||
    helpers.safeGetFirstWord(this.google.name);
  return username;
});


//// methods
//// ours
//var defaultCallback = function (err) {
  //if (err) {console.log(err)}
//}
//// add follower
userSchema.methods.addFollower = function (followeeId) {
  if (!(followeeId in this.following)){
  this.following.push(followeeId);
  }
  this.save(function (err){
    if (err) return console.error(err);
  });
}

////remove follower
userSchema.methods.removeFollower = function (followeeId) {
  this.following.remove(followeeId);
  this.save(function (err){
    if (err) return console.error(err);
  });
}

//// add recently viewed story
userSchema.methods.addRecentlyViewedStory = function (storyId) {
  this.recentlyViewedStories.push(storyId);
  //this.save(defaultCallback);
}
//// add contributed story
userSchema.methods.addContributedStory = function (storyId) {
  this.contributedStories.push(storyId);
  //this.save(defaultCallback);
}
//// add saved story
userSchema.methods.addSavedStory = function (storyId) {
  this.savedStories.push(storyId);
  //this.save(defaultCallback);
}


// passport.js
// generating a hash
userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
// check if password is valid
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.local.password);
};

//create the model for users and expose it to the app
module.exports = mongoose.model('User', userSchema);
