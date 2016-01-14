var express = require('express');
var router = express.Router();
var db = require('../db-setup.js');
var assert = require('assert');
var fs = require('fs');
var path = require('path');

var roomTextDir = 'bootstrap-data/room-text';

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'The Rolling Story' });
});

/* GET room page. */
router.get('/room', function(req, res, next) {

    // Initial bootstrapped room data
    db.rooms.remove();
    db.rooms.insert({
        _id: 'main-room',
        contributions: []
    });
    var filenames = fs.readdirSync(roomTextDir);
    var filePath;
    var filename;
    var text;
    for (var idx = 0; idx < filenames.length; idx++) {
        filename = filenames[idx];
        filePath = path.join(roomTextDir, filename);
        text = fs.readFileSync(filePath, 'utf8');
        //console.log(filename);
        //console.log(text);
        db.rooms.update(
            {_id: 'main-room'},
            {$push: {contributions: {user: filename, text: text}}},
            function (err) {}
        );
    }

    var roomName = req.query.roomname;
    console.log('********');
    console.log(roomName);
    db.rooms.find({}).toArray(function (err, rooms) {
        console.log('foob');
        console.log(rooms);
    });
    console.log('Routing...');
    db.rooms.find({_id: roomName}).toArray(function (err, rooms) {
        console.log('Finding...');
        var numRoomsFound = 0;
        console.log(rooms.length);
        rooms.forEach(function (room) {
            console.log('Iterating...');
            numRoomsFound++;
            assert(numRoomsFound == 1);
            console.log('Rendering...');
            res.render('room', {
                title: roomName,
                contributions: room.contributions,
                userTurn: false
            });
        });
    });
});

module.exports = router;
