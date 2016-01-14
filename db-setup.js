var mongo = require('mongodb').MongoClient;
var dbConnectionUrl = 'mongodb://localhost:27017/test';
var collections = {};

//var defaultTextFilename = 'bootstrap-data/default-room-text.txt'
var roomTextDir = 'bootstrap-data/room-text';

mongo.connect(dbConnectionUrl, function (err, db) {
    if (err) {
        console.log('Can not connect to MongoDB. Did you run it?');
        console.log(err.message);
        return;
    }

    collections.users = db.collection('users');
    collections.rooms = db.collection('rooms');
});


module.exports = collections;
