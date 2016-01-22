var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var helpers = require('../lib/helpers');

// define the schema for our user model
var userSchema = mongoose.Schema({

  //username: String,
  recentlyViewedStories: [String],  // story ids
  contributedStories: [String],  // story ids
  savedStories: [String],  // story ids
  following: [String],  // user ids
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


// methods
// ours
// add follower
userSchema.methods.addFollower = function (followerId, followeeId) {
  this.model('User').findByIdAndUpdate(
    this.id,
    {$push: {following: followeeId}},
    {},  // opitons
    function (err, model) {
      if (err) console.err(err);
    }
  );
}
// add recently viewed story
userSchema.methods.addRecentlyViewedStory = function (storyId) {
  this.model('User').findByIdAndUpdate(
    this.id,
    {$push: {recentlyViewedStories: storyId}},
    {},  // opitons
    function (err, model) {
      if (err) console.err(err);
    }
  );
}
// add contributed story
userSchema.methods.addContributedStory = function (storyId) {
  this.model('User').findByIdAndUpdate(
    this.id,
    {$push: {contributedStories: storyId}},
    {},  // opitons
    function (err, model) {
      if (err) console.err(err);
    }
  );
}
// add saved story
userSchema.methods.addSavedStory = function (storyId) {
  this.model('User').findByIdAndUpdate(
    this.id,
    {$push: {savedStories: storyId}},
    {},  // opitons
    function (err, model) {
      if (err) console.err(err);
    }
  );


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
