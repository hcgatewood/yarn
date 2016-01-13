var mongo = require('mongodb').MongoClient;
var dbConnectionUrl = 'mongodb://localhost:27017/test';
var collections = {};
var fs = require('fs');

var defaultTextFilename = 'bootstrap-data/default-room-text.txt'

mongo.connect(dbConnectionUrl, function (err, db) {
    if (err) {
        console.log('Can not connect to MongoDB. Did you run it?');
        console.log(err.message);
        return;
    }

    collections.users = db.collection('users');
    collections.rooms = db.collection('rooms');

    // Initial bootstrapped data
    collections.rooms.drop()
    fs.readFile(defaultTextFilename, 'utf8', function (err, text) {
        if (err) {
            console.log('Cannot read from: ' + defaultTextFilename);
            return;
        }
        collections.rooms.insert({
            _id: 'main-room',
            text: text
        });
    });
});


module.exports = collections;
