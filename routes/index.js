var express = require('express');
var router = express.Router();
var db = require('../db-setup.js');
var assert = require('assert');
var bootstrapSync = require('../lib/bootstrapSync.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'The Rolling Story' });
});

/* GET room page. */
router.get('/rooms/:roomName', function(req, res, next) {

  bootstrapSync.reloadRoomData();

  // Serve room page with appropriate data
  var roomName = req.params.roomName;
  db.rooms.find({_id: roomName}).toArray(function (err, rooms) {
    var numRoomsFound = 0;
    rooms.forEach(function (room) {
      numRoomsFound++;
      assert(numRoomsFound == 1);
      res.render('room', {
        title: roomName,
        contributions: room.contributions,
        userTurn: true
      });
    });
  });
});

module.exports = router;
