var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var findOrCreate = require('mongoose-findorcreate');
var _ = require('underscore');
var helpers = require('../lib/helpers');

var Story = require('../models/story');

// schema for the room model
var roomSchema = new mongoose.Schema({

  // meta
  name: String,
  story: {type: Schema.Types.ObjectId, ref: 'Story'},
  //isActive: Boolean,

  // user lists
  //currentWriter: {type: Schema.Types.ObjectId, ref: 'User'},
  moderators: [ {type: Schema.Types.ObjectId, ref: 'User'} ],
  readers: [ {type: Schema.Types.ObjectId, ref: 'User'} ],
  orderedWriters: [ {type: Schema.Types.ObjectId, ref: 'User'} ],
  orderedWaiters: [ {type: Schema.Types.ObjectId, ref: 'User'} ],
  bannedFromWriting: [ {type: Schema.Types.ObjectId, ref: 'User'} ],

  // counts
  numReaders: {type: Number, default: 0},
  maxWriters: {type: Number, default: 0},
  totalTurns: {type: Number, default: 0},
  currentTurns: {type: Number, default: 0}

});
roomSchema.plugin(findOrCreate);

// methods
// require room (room must exist and have an associated story)
roomSchema.statics.requireRoom = function (roomName, callback) {
  var roomModel = this;
  this.findOrCreate({name: roomName}, function (err, room, created) {
    if (err) console.log('err:', count);
    // make new story and room if necessary
    console.log('type of room.story', typeof room.story);
    if (typeof room.story === 'undefined') {
      console.log('@@@ creating new story @@@');
      var story = new Story();
      room.story = story;
      room.save();
      story.save(function () {
        roomModel.findOne({name: roomName}).populate('story').exec(function (err, room) {
          callback(room, room.story);
        });
      });
    } else {
      console.log('@@@ using existing story @@@');
      roomModel.findOne({name: roomName}).populate('story').exec(function (err, room) {
        callback(room, room.story);
      });
    }
  });
}
// change writer turns
roomSchema.methods.changeWriterTurns = function () {
  // rotate the ordered writers array
  var recentWriter = this.orderedWriterIds.shift();
  if (typeof recentWriter !== 'undefined') this.orderedWriterIds.push(recentWriter);
  // update current writer
  this.currentWriterId = this.orderedWriterIds.length > 0
    ? this.orderedWriterIds[0]
    : undefined
  // update num turns
  this.currentTurns++;
  this.save(helpers.genericErrCallback);
}

// add user to writers list / waitlist
roomSchema.methods.addWriter = function (userId) {
  // if there's room on the writers list add the user as a
  // writer, otherwise add the to the waitlist
  if (this.orderedWriterIds.length < maxWriters) {
    this.orderedWriterIds.push(userId);
  } else {
    this.orderedWaitlistIds.push(userId);
  }
  this.isActive = true;
  this.save(helpers.genericErrCallback);
}

// remove user from writers list / waitlist
roomSchema.methods.removeWriter = function (userId) {
  this.orderedWriterIds = _.without(orderedWriterIds, userId);
  this.orderedWaitlistIds = _.without(orderedWaitlistIds, userId);
  if (this.currentWriterId === userId) this.changeWriterTurns();
  if (this.orderedWriterIds.length === 0) this.isActive = false;
  this.save(helpers.genericErrCallback);
}

// add reader to the room
roomSchema.methods.addReader = function (user) {
  if (typeof user !== 'undefined') this.readerIds[user.id] = true;
  this.numReaders++;
  this.save(helpers.genericErrCallback);
}

// remove reader from the room
roomSchema.methods.removeReader = function (user) {
  if (typeof user !== 'undefined') delete this.readerIds[user.id];
  this.numReaders--;
  this.save(helpers.genericErrCallback);
}

module.exports = mongoose.model('Room', roomSchema);
