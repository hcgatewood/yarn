var mongoose = require('mongoose');
var _ = require('underscore');
var helpers = require('../lib/helpers');

// schema for the room model
var roomSchema = mongoose.Schema({

  // meta
  name: String,
  currentStoryId: String,
  isActive: Boolean,

  // user lists
  currentWriterId: String,
  moderatorIds: [String],
  readerIds: {String: Boolean},
  orderedWriterIds: [String],
  orderedWaitlistIds: [String],
  bannedUserIds: [String],

  // counts
  numReaders: Number,
  maxWriters: Number,
  totalTurns: Number,
  currentTurns: Number

});

// methods
// change writer turns
roomSchema.methods.changeWriterTurns = function () {
  // rotate the ordered writers array
  var recentWriter = this.orderedWriterIds.shift();
  if (typeof recentWriter !== 'undefined') {
    this.orderedWriterIds.push(recentWriter);
  }
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
  this.save(helpers.genericErrCallback);
}

// remove user from writers list / waitlist
roomSchema.methods.removeWriter = function (userId) {
  this.orderedWriterIds = _.without(orderedWriterIds, userId);
  this.orderedWaitlistIds = _.without(orderedWaitlistIds, userId);
  if (this.currentWriterId === userId) {
    this.changeWriterTurns();
  } else {
    this.save(helpers.genericErrCallback);
  }
}

// add reader to the room
roomSchema.methods.addReader = function (userId) {
  this.readerIds[userId] = true;
  this.numReaders++;
  this.save(helpers.genericErrCallback);
}

// remove reader from the room
roomSchema.methods.removeReader = function (userId) {
  delete this.readerIds[userId];
  this.numReaders--;
  this.save(helpers.genericErrCallback);
}

module.exports = mongoose.model('Room', roomSchema);
