var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var helpers = require('../lib/helpers');
var Schema = mongoose.Schema;
var ObjectID = require('mongodb').ObjectID;


// define the schema for our user model
var userSchema = new mongoose.Schema({

  //username: {type: String, default: 'todo'},
  recentlyViewedStories: [ {type: Schema.Types.ObjectId, ref: 'Story'} ],
  contributedStories: [ {type: Schema.Types.ObjectId, ref: 'Story'} ],
  savedStories: [ {type: Schema.Types.ObjectId, ref: 'Story'} ],
  following: [String],
  follower: [String],
  //followers: [ {type: Schema.Types.ObjectId, ref: 'User'} ]

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
userSchema.statics.getPageUsername = function (id, callback){
  var userModel = this;

  userModel.findById(id, function (err, user) {
        callback(user.username);
  });
}

userSchema.statics.follows = function (user_id, page_id, callback){
  var userModel = this;

  userModel.findById(page_id, function (err, user) {
         return callback(user.follower.indexOf(user_id)> -1)
   });     
  };
 
 userSchema.statics.getUser = function (user_id, callback){
  var userModel = this;
  userModel.findById(user_id, function (err, user) {
         return callback(user)
   });     
  };

userSchema.statics.getFollowingUsername = function (id, callback){
  var userModel = this;

  userModel.findById(id, function (err, user) {
    if (user) {
      var userIds = [];
      user.following.forEach(function(item) {
        userIds.push(ObjectID(item));
      });
      userModel.find({ _id: {$in : userIds}},function (err, following_user)  {
      //get follower ids/usernames
      var following = [];
      following_user.forEach(function(item) {
        if (item.local.username){
          following.push([item.local.username, item._id])
        }if (item.facebook.name){
          following.push([item.google.name, item._id])
        }if (item.google.name){
          following.push([item.facebook.name, item._id])
          }
        });

        callback(following);
      });
    }
  });
}

userSchema.statics.getFollowerUsername = function (id, callback){
  var userModel = this;

  userModel.findById(id, function (err, user) {
    if (user) {
      var userIds = [];
      user.follower.forEach(function(item) {
        userIds.push(ObjectID(item));
      });
      userModel.find({ _id: {$in : userIds}},function (err, follower_user)  {

      //get follower ids/usernames
      var follower = [];
      follower_user.forEach(function(item) {
        if (item.local.username){
          follower.push([item.local.username, item._id])
        }if (item.facebook.name){
          follower.push([item.google.name, item._id])
        }if (item.google.name){
          follower.push([item.facebook.name, item._id])
          }
        });

        callback(follower) 
      });
    }
  });
}

//// add follower
userSchema.methods.addFollow = function (followeeId) {
  //this.follower.indexOf(followerId)> -1
  if (!(this.following.indexOf(followeeId)> -1)){
  this.following.push(followeeId);
  }
  this.save()
}

userSchema.methods.addFollower = function (followerId) {
  if (!(this.follower.indexOf(followerId)> -1)){
  this.follower.push(followerId);
  }
  this.save()

}


////remove follower
userSchema.methods.removeFollow = function (followeeId) {
  this.following.remove(followeeId);
  this.save()
}

userSchema.methods.removeFollower = function (followerId) {
  this.follower.remove(followerId);
  this.save()
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

