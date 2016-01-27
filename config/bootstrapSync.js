module.exports = function (app) {

  var fs = require('fs');
  var path = require('path');
  var Story = app.models.story;

  exports = {
    // Boostrap room data synchronously
    // NOTE: deletes db.rooms data
    reloadRoomData: function (room, story, callback) {
      var roomTextDir = __dirname + '/bootstrap-data/room-text';
      var filenames = fs.readdirSync(roomTextDir);
      var filePath;
      var filename;
      var text;
      var roomName = 'demo';
      // Populate.rooms with text from repo txt files
      for (var idx = 0; idx < filenames.length; idx++) {
        filename = filenames[idx];
        filePath = path.join(roomTextDir, filename);
        text = fs.readFileSync(filePath, 'utf8');
        story.addContribution(filename, text);
      }
      story.save(function () {
        console.log('####', story.orderedContributions);
        callback();
      });
    }
  }
  return exports;

}
