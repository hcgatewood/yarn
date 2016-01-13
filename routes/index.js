var express = require('express');
var router = express.Router();
var db = require('../db-setup.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'The Rolling Story' });
});

/* GET room page. */
router.get('/room', function(req, res, next) {
    db.rooms.find({}).toArray(function (err, rooms) {
        var roomTexts = {};
        rooms.forEach(function (room) {
            roomTexts[room._id] = room.text;
        });
        res.render('room', {
            title: 'Main Room',
            storyText: roomTexts['main-room'],
            userTurn: false
        });
    });
});

module.exports = router;
