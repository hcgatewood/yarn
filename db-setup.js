var mongo = require('mongodb').MongoClient;
var dbConnectionUrl = 'mongodb://localhost:27017/test';
var collections = {};
var fs = require('fs');
var path = require('path');

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

    //// Initial bootstrapped room data
    //collections.rooms.drop();
    //collections.rooms.insert({
        //_id: 'main-room',
        //contributions: []
    //});
    //var filenames = fs.readdirSync(roomTextDir);
    //var filePath;
    //var filename;
    //var text;
    //for (var idx = 0; idx < filenames.length; idx++) {
        //filename = filenames[idx];
        //filePath = path.join(roomTextDir, filename);
        //text = fs.readFileSync(filePath, 'utf8');
        ////console.log(filename);
        ////console.log(text);
        //collections.rooms.update(
            //{_id: 'main-room'},
            //{$push: {contributions: {user: filename, text: text}}}
        //);
    //}
});


module.exports = collections;
