var mongo = require('mongodb').MongoClient;
var dbConnectionUrl = process.env.PROC_MONGODB || 'mongodb://localhost:27017/test';
var collections = {};

//var defaultTextFilename = 'bootstrap-data/default-room-text.txt'
var roomTextDir = 'bootstrap-data/room-text';

mongo.connect(dbConnectionUrl, function (err, db) {
  if (err) {
    console.log('Can not connect to MongoDB.');
    console.log(err.message);
    return;
  }

  collections.users = db.collection('users');
  collections.rooms = db.collection('rooms');
});


module.exports = collections;
