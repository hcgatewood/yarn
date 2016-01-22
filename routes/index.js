module.exports = function (app, passport) {
  var db = require('../config/db-setup.js');
  var bootstrapSync = require('../config/bootstrapSync.js');
  var helpers = require('../lib/helpers.js');

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
  app.get('/user/:_id', function (req, res, next) {
    var username = getUsername(req);
    var user_since = getInsertDate(req);
    res.render('user_page', {
      title: 'Rolling Story',
      username: username,
      user: req.user,
      user_since: user_since,
      startWriting: true
    });
  });
  app.post('/user/:_id',passport.authenticate('local-signup', { successRedirect: '/',failureRedirect: '/login' })
  );


  // GET room page
  app.get('/rooms/:roomName', function (req, res, next) {

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
  app.get('/auth/facebook', passport.authenticate('facebook',{
    scope: ['public_profile', 'email']
  }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {failureRedirect : '/'}),
          function (req, res){
            if (req.user){
            return res.redirect('/user/'+req.user._id)
            }
          }
        );
  // GET Google login
  app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
            passport.authenticate('google', {failureRedirect : '/'}),
            function (req, res){
              if (req.user){
              return res.redirect('/user/'+req.user._id)
        }
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
  app.get('/', function (req, res) {
    res.render('navbar.ejs', {message: req.flash('loginMessage')});
    //res.render('tmp-login.ejs', {message: ['pls']});
  });

    // POST signup-login
  app.post('/signup', passport.authenticate("local-signup", {
    failureRedirect: '/',
    failureFlash: true }),
    function (req, res){
      if (req.user){
        return res.redirect('/user/'+req.user._id)
      }
    }
    );


  app.post('/login', passport.authenticate("local-login", {
    failureRedirect: '/',
    failureFlash: true
  }),
    function (req, res){
      if (req.user){
        return res.redirect('/user/'+req.user._id)
      }
    }
  );


  // POST logout
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect(req.get('referer'));  // Redirect back to same page
  });


  function getInsertDate(req){
    if (req.user){
    var date=req.user._id.getTimestamp()
    var user_since=(date.getMonth()+1)+"/"+ date.getDate()+"/"+date.getFullYear();
    return user_since
    }
  }

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }

  // Gets the user's username, defaulting to 'anonymous'
  // if they are not logged in
  function getUsername(req) {
    var username = req.user ? req.user.username : 'anonymous';
    return username;
  }

}
