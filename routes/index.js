module.exports = function (app, passport) {
  var db = require('../db-setup.js');
  var assert = require('assert');
  var bootstrapSync = require('../lib/bootstrapSync.js');
  var _ = require('underscore');

  // GET home page
  app.get('/', function(req, res, next) {
    res.render('index', { title: 'The Rolling Story' });
  });

  // GET find page
  app.get('/find', function(req,res){
    res.render('find', {title:'Find a Story!'});
  });

  // GET room page
  app.get('/rooms/:roomName', function(req, res, next) {

    bootstrapSync.reloadRoomData();

    var username;
    if (_.has(req, 'user')) {
      username = req.user.local.username;
    } else {
      username = 'anonymous';
    }
    console.log('username:', username);
    console.log('user:', req.user);

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
          username: username,
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
    successRedirect: '/passport-info',
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
}
