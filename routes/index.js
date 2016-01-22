module.exports = function (app, passport) {
  var db = require('../db-setup.js');
  var bootstrapSync = require('../config/bootstrapSync.js');

  // GET home page
  app.get('/', function (req, res, next) {
    var username = getUsername(req);
    res.render('index', {
      title: 'Rolling Story',
      username: username,
      user: req.user,
      startWriting: true
    });
  });

  // GET find page
  app.get('/find', function (req, res){
    var username = getUsername(req);
    res.render('find', {
      title:'Find a Story!',
      username: username,
      startWriting: true,
      user: req.user
    });
  });


  // GET user page
  app.get('/user', function (req, res, next) {
    var username = getUsername(req);
    res.render('user_page', {
      title: 'Rolling Story',
      username: username,
      user: req.user,
      startWriting: true
    });
  });
  // GET room page
  app.get('/rooms/:roomName', function (req, res, next) {

    console.log('### db reload decision');
    // If RELOAD_DB is defined, use it's value, otherwise choose a default value
    var reloadDb = typeof process.env.RELOAD_DB !== 'undefined'
      ? process.env.RELOAD_DB == 'true'
      : false;
    console.log(process.env.RELOAD_DB);
    if (reloadDb) {
      console.log('@@@ RELOADING ROOM DATA');
      bootstrapSync.reloadRoomData();
    }

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
          startWriting: false,
          userTurn: true
        });
      });
    });
  });
  // GET Facebook login
  app.get('/auth/facebook', passport.authenticate('facebook',{ scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/rooms/main',
            failureRedirect : '/'
        }));
  // GET Google login
  app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                    successRedirect : '/rooms/main',
                    failureRedirect : '/'
            }));
  // PASSPORT
  // GET passport-info
  app.get('/passport-info', function (req, res) {
    res.render('passport-info', {
      user: req.user
    });
  });
  // GET login
  // TODO: permanent login
  app.get('/', function (req, res) {
    res.render('navbar.ejs', {message: req.flash('loginMessage')});
    //res.render('tmp-login.ejs', {message: ['pls']});
  });

    // POST login
  app.post('/signup', passport.authenticate("local-signup", {
    successRedirect: '/find',
    failureRedirect: '/',
    failureFlash: true
  }));

  app.post('/login', passport.authenticate("local-login", {
    successRedirect: '/find',
    failureRedirect: '/',
    failureFlash: true
  }));


  // POST logout
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect(req.get('referer'));  // Redirect back to same page
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
      var localName = req.user.local.username;
      var fbUsername = firstName(req.user.facebook.name);
      var googleUsername = firstName(req.user.google.name);
      username = req.user.local.username ||
        fbUsername ||
        googleUsername;
    } else {
      username = 'anonymous';
    }
    console.log('username:', username);
    console.log('user:', req.user);
    return username;
  }

  function firstName(fullName) {
    console.log('***', fullName)
    if (typeof fullName == 'string') {
      return fullName.split(' ')[0];
    } else {
      return fullName;
    }
  }
}
