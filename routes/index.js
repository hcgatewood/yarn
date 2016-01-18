module.exports = function (app, passport) {
  var db = require('../db-setup.js');
  var bootstrapSync = require('../config/bootstrapSync.js');

  // GET home page
  app.get('/', function (req, res, next) {
    var username = getUsername(req);
    res.render('index', {
      title: 'Rolling Story',
      username: username,
      user: req.user
    });
  });

  // GET find page
  app.get('/find', function (req, res){
    var username = getUsername(req);
    res.render('find', {
      title:'Find a Story!',
      username: username,
      user: req.user
    });
  });

  // GET room page
  app.get('/rooms/:roomName', function (req, res, next) {

    //bootstrapSync.reloadRoomData();

    var roomName = req.params.roomName;
    var username = getUsername(req);

    var roomsCursor = db.rooms.find({_id: roomName});
    roomsCursor.count(function (err, numRooms) {
      if (numRooms === 0) {
        // Insert new room
        console.log('Generating new room:', roomName);
        db.rooms.insert({
          _id: roomName,
          contributions: []
        });
      } else if (numRooms > 1) {
        // Log that we have too many
        console.log('Rip, duplicate rooms');
      } else {
        console.log('Rendering already existing room');
      }
      // Render the room
      roomsCursor.nextObject(function (err, room) {
        res.render('room', {
          title: roomName,
          contributions: room.contributions,
          username: username,
          user: req.user,
          userTurn: true
        });
      });
    });
  });

  // PASSPORT
  // GET passport-info
  app.get('/passport-info', function (req, res) {
    res.render('passport-info', {
      user: req.user
    });
  });
  // GET login
  // TODO: permanent login
  app.get('/login', function (req, res) {
    res.render('tmp-login.ejs', {message: req.flash('loginMessage')});
  });
  // GET signup
  app.get('/signup', function (req, res) {
    res.render('tmp-signup.ejs', {message: req.flash('signupMessage')});
  });
  // POST signup
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/rooms/main',
    failureRedirect: '/signup',
    failureFlash: true
  }));
  // POST login
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/rooms/main',
    failureRedirect: '/login',
    failureFlash: true
  }));
  // POST logout
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }

  function getUsername(req) {
    var username;
    if (req.user) {
      username = req.user.local.username;
    } else {
      username = 'anonymous';
    }
    console.log('username:', username);
    console.log('user:', req.user);
    return username;
  }
}
