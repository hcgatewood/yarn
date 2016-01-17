var db = require('../db-setup.js');
var fs = require('fs');
var path = require('path');

module.exports = {
  // Boostrap room data synchronously
  // NOTE: deletes db.rooms data
  reloadRoomData: function () {
    var roomTextDir = 'bootstrap-data/room-text';
    db.rooms.remove();
    db.rooms.insert({
      _id: 'main',
      contributions: []
    });
    var filenames = fs.readdirSync(roomTextDir);
    var filePath;
    var filename;
    var text;
    // Populate db.rooms with text from repo txt files
    for (var idx = 0; idx < filenames.length; idx++) {
      filename = filenames[idx];
      filePath = path.join(roomTextDir, filename);
      text = fs.readFileSync(filePath, 'utf8');
      db.rooms.update(
        {_id: 'main'},
        {$push: {contributions: {user: filename, text: text}}},
        function (err) {}
      );
    }
  }
}
