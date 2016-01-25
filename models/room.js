module.exports = function (app) {

  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;
  var findOrCreate = require('mongoose-findorcreate');
  var _ = require('underscore');
  var IdToInterval = require('./intervals');
  var helpers = require('../lib/helpers');
  var Story = app.models.story;

  // schema for the room model
  var roomSchema = new mongoose.Schema({

    // meta
    name: String,
    story: {type: Schema.Types.ObjectId, ref: 'Story'},
    turnLenMs: {type: Number, min: 1*1000, default: 50*1000},
    //isActive: Boolean,

    // user lists
    //currentWriter: {type: Schema.Types.ObjectId, ref: 'User'},
    moderators: [ {type: Schema.Types.ObjectId, ref: 'User'} ],
    readers: [ {type: Schema.Types.ObjectId, ref: 'User'} ],
    orderedWriters: [ {type: Schema.Types.ObjectId, ref: 'User'} ],
    orderedWaiters: [ {type: Schema.Types.ObjectId, ref: 'User'} ],
    bannedFromWriting: [ {type: Schema.Types.ObjectId, ref: 'User'} ],

    // counts
    numReaders: {type: Number, min: 0, default: 0},
    // TODO: set these values
    maxWriters: {type: Number, min: 1, default: 2},
    totalTurns: {type: Number, min: 1, default: 2},
    currentTurns: {type: Number, min: 0, default: 0}

  });
  roomSchema.plugin(findOrCreate);

  // methods
  // require room (room must exist and have an associated story)
  roomSchema.statics.requireRoom = function (roomName, callback) {
    var roomModel = this;
    this.findOrCreate({name: roomName}, function (err, room, created) {
      if (err) console.log('err:', count);
      // make new story and room if necessary
      if (typeof room.story === 'undefined') {
        console.log('@@@ creating new story @@@');
        // start the room interval if necessary
        IdToInterval.update(room.id, room.turnLenMs, roomModel);
        var story = new Story();
        room.story = story;
        room.save();
        story.save(function () {
          roomModel
            .findOne({name: roomName})
            .populate('story')
            .exec(function (err, room) {
              callback(room, room.story);
            });
        });
      } else {
        room.save();
        console.log('@@@ using existing story @@@');
        if (!IdToInterval.hasInterval(room.id)) {
          IdToInterval.update(room.id, room.turnLenMs, roomModel);
        }
        roomModel
          .findOne({name: roomName})
          .populate('story')
          .exec(function (err, room) {
            callback(room, room.story);
          });
      }
    });
  }
  // performs the passed callback if it is the user's turn in the room
  roomSchema.statics.ifUserTurn = function (roomId, userId, callback) {
    this.findById(roomId, function (err, room) {
      var currentWriterId = room.orderedWriters[0];
      console.log('userId defined, equal', typeof currentWriterId !== 'undefined',
                  userId == currentWriterId);
      console.log('ids:', userId, currentWriterId);
      var isUserTurn = (typeof currentWriterId !== 'undefined') &&
        (userId == currentWriterId);
      if (isUserTurn) {
        console.log('is user turn');
        callback(room.orderedWriters);
      } else {
        console.log('is not user turn');
      }
    });
  }
  // change writer turns
  roomSchema.statics.changeWriterTurns = function (roomId, dropUser) {
    console.log('\n\n\nCHANGING WRITER TURN:', roomId, '\n\n\n');
    var roomModel = this;
    this.findById(roomId, function (err, room) {
      if (room === null) {
        console.log('\n\ncannot find room by id:', roomId, '\n\n');
        IdToInterval.remove(roomId);
        return;
      }
      IdToInterval.update(room.id, room.turnLenMs, roomModel);
      if (room.orderedWriters.length > 0) {
        var recentWriter = room.orderedWriters[0];
        room.orderedWriters.pull(recentWriter);
        if (! dropUser === true) {
          room.orderedWriters.addToSet(recentWriter);
          room.currentTurns++;
        }
      }
      // publish the story if it's finished
      console.log('room num turns:', room.currentTurns, room.totalTurns);
      if (room.currentTurns === room.totalTurns) {
        var oldStoryId = room.story;
        Story.findById(oldStoryId, function (err, story) {
          if (err) console.log('err:', err);
          story.isFinished = true;
          story.save(function (err) {if (err) console.log('err:', err)});
        });
        console.log('\n\n### NEW STORY IN ROOM ###');
        var newStory = new Story();
        room.story = newStory;
        room.currentTurns = 0;
        newStory.save(function () {
          app.io.to(roomId).emit('new story', {
            storyId: room.story.id
          });
        });
      }
      room.save(function (err) {
        if (err) console.log('err:', err);
        console.log('writers:', room.orderedWriters);
        app.io.to(roomId).emit('turn update', {
          orderedWriters: room.orderedWriters,
          currentWriter: room.orderedWriters[0],
          turnLenMs: room.turnLenMs
        });
      });
    });
  }

  // add user to writers list / waitlist
  roomSchema.statics.addWriter = function (roomId, userId) {
    // if there's room on the writers list add the user as a
    // writer, otherwise add the to the waitlist
    if (userId === '') return;
    var roomModel = this;
    this.findById(roomId, function (err, room) {
      if (err) console.log('err:', err);
      // reset interval if they're the current writer now
      if (room.orderedWriters.length === 0) {
        console.log('SINGLE WRITER:', userId);
        IdToInterval.update(room.id, room.turnLenMs, roomModel);
        app.io.to(roomId).emit('turn update', {
          orderedWriters: [userId],
          currentWriter: userId,
          turnLenMs: room.turnLenMs
        });
      }
      // add as either writer or reader
      if (room.orderedWriters.length <= room.maxWriters) {
        console.log('ADDING ROOM WRITER');
        room.orderedWriters.addToSet(userId);
      } else {
        room.orderedWaiters.addToSet(userId);
      }
      room.save(function (err) {if (err) console.log('err:', err)});
    });
  }

  // remove user from writers / readers
  roomSchema.statics.removeWriter = function (roomId, userId) {
    var roomModel = this;
    if (userId !== '') {
      this.findById(roomId, function (err, room) {
        if (err) console.log('err:', err);
        console.log('REMOVING WRITER');
        // TODO below is causing a fixable document lock-violation
        // when the current user leaves the room
        if (room.orderedWriters[0] == userId) {
          roomModel.changeWriterTurns(roomId, true);
        }
        room.orderedWriters.pull(userId);
        room.orderedWaiters.pull(userId);
        room.save(function (err) {if (err) console.log('err:', err)});
      });
    }
  }

  // add reader to the room
  roomSchema.statics.addReader = function (roomId, userId) {
    if (userId) {
      console.log('adding reader:', roomId, userId);
      this.findById(roomId, function (err, room) {
        if (err) {
          console.log('err:', err);
          return;
        }
        room.readers.addToSet(userId);
        room.numReaders = room.readers.length;
        room.save(function (err) {if (err) console.log('err:', err)});
      });
    } else {
      console.log('not adding reader');
    }
  }

  // remove reader from the room
  roomSchema.statics.removeReader = function (roomId, userId) {
    if (userId) {
      console.log('removing reader:', roomId, userId);
      this.findById(roomId, function (err, room) {
        if (err) {
          console.log('err:', err);
          return;
        }
        if (room === null) {
          console.log('\n\ncannot find room by id:', roomId, '\n\n');
          return;
        }
        console.log(room);
        room.readers.pull(userId);
        room.numReaders = room.readers.length;
        room.save(function (err) {if (err) console.log('err:', err)});
      });
    } else {
      console.log('not removing reader');
    }
  }

  return mongoose.model('Room', roomSchema);

}
