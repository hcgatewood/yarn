var fs = require('fs');
var path = require('path');
var Room = require('../models/room');
var Story = require('../models/story');

module.exports = {
  // Boostrap room data synchronously
  // NOTE: deletes db.rooms data
  reloadRoomData: function () {
    var roomTextDir = 'bootstrap-data/room-text';
    var filenames = fs.readdirSync(roomTextDir);
    var filePath;
    var filename;
    var text;
    Room.remove({}, function (err) {
      var roomName = 'main';
      Room.requireRoom(roomName, function (room, story) {
        // Populate.rooms with text from repo txt files
        for (var idx = 0; idx < filenames.length; idx++) {
          filename = filenames[idx];
          filePath = path.join(roomTextDir, filename);
          text = fs.readFileSync(filePath, 'utf8');
          Story.addContribution(story.id, filename, text);
        }
      });
    });
  }
}
