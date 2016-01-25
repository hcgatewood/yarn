var ObjectID = require('mongodb').ObjectID;

module.exports = function (app, passport) {
  var Room = require('../models/room');
  var Story = require('../models/story');
  var bootstrapSync = require('../config/bootstrapSync.js');
  var helpers = require('../lib/helpers.js');
  //User Upload Files
  var multer  = require('multer')
  var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
  var upload = multer({ storage: storage})
  var MAU = require('../lib/modify-and-upload.js');
  //var User = require('mongoose').model('User').schema
  var User = require('../models/user.js');
  var mongodb = require("mongodb")


  // GET home page
  app.get('/', function (req, res, next) {
    var id = getUserId(req);
    var username = getUsername(req);
    res.render('index', {
      title: 'Rolling Story',
      username: username,
      id: id,
      user: req.user,
      startWriting: true
    });
  });

  // GET find page
  app.get('/find', function (req, res){
    var id = getUserId(req);
    var username = getUsername(req);
    res.render('find', {
      title:'Find a Story!',
      username: username,
      id: id,
      startWriting: true,
      user: req.user
    });
  });

  // GET user page
  app.get('/user/:id', upload.single('image'),function (req, res, next) {
    var id=getUserId(req);
    var page_id=req.params.id
    var username = getUsername(req);
    var user_since = getInsertDate(req);
    var belongs_to_user = (id==req.params.id);

    //redirects to 404 page
    if(!(ObjectID.isValid(page_id))){
      res.redirect('/error')
    }

    //get follower ids
    User.findById(page_id, function (err, user) {
      console.log(user)
      if (user) {
        var userIds = [];
        user.following.forEach(function(item) {
          userIds.push(ObjectID(item));
        });

    User.find({ _id: {$in : userIds}},function (err, follow_user)  {

      //get follower ids/usernames
      var user_follow = [];
      follow_user.forEach(function(item) {
        if (item.local.username){
          user_follow.push([item.local.username, item._id])
        }if (item.facebook.name){
          user_follow.push([item.google.name, item._id])
        }if (item.google.name){
          user_follow.push([item.facebook.name, item._id])
        }
      });

      res.render('user_page', {
        title: 'Rolling Story',
        username: username,
        id: id,
        follow: user_follow,
        page_id: page_id,
        status: 'Ready to upload',
        newImage: 'http://placehold.it/175x175',
        user: req.user,
        belongs_to_user: belongs_to_user,
        user_since: user_since,
        startWriting: true
      });   
        });  
      }
    });
  });

  //POST image upload
  app.post('/user/:id', upload.single('image'),function (req,res) {
    var id= getUserId(req);
    var page_id=req.params.id
    var username = getUsername(req);
    var user_since = getInsertDate(req);
    var belongs_to_user = (id==req.params.id)

    var mau = new MAU(req.file, function (err, newImagePath){
    if(req.file){
      res.render('user_page', {
      status: 'Finished uploading',
      newImage: './uploads/'+req.file.filename,
      title: 'Rolling Story',
      username: username,
      page_id: page_id,
      id: id,
      user: req.user,
      belongs_to_user: belongs_to_user,
      user_since: user_since,
      startWriting: true
        });
      }
    });
  });

  app.post('/follow', function(req,res){
    var id= getUserId(req);
    var page_id=req.body.page_id

      if (req.body.submit){
      User.findById(id, function (err, user) {
      user.addFollower(page_id, function(err){
        console.log(user.following)
        });
      console.log(user.following)
      });
    }


  })

    app.post('/unfollow', function(req,res){
    var id= getUserId(req);
    var page_id=req.body.page_id

      if (req.body.submit){
      User.findById(id, function (err, user) {
      user.removeFollower(page_id, function(err){
        console.log(user.following)
        });
            console.log(user.following)
      });
    }
  })


  // GET room page
  app.get('/rooms/:roomName', function (req, res, next) {
    var roomName = req.params.roomName;
    var username = getUsername(req);
    var id = getUserId(req);
    var userId = typeof req.user !== 'undefined' ? req.user.id : '';
    Room.requireRoom(roomName, function (room, story) {
      // render the room
      res.render('room', {
        title: roomName,
        contributions: story.orderedContributions,
        username: username,
        storyId: story.id,
        roomId: room.id,
        userId: userId,
        id: id,
        user: req.user,
        startWriting: false,
        // TODO below needs to change
        userTurn: true
      });
    });
  });


  //GET error page
  app.get('/error', function (req, res, next) {
    var id = getUserId(req);
    var username = getUsername(req);
    res.render('errorpage', {
      title: 'Rolling Story',
      username: username,
      id: id,
      user: req.user,
      startWriting: true
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
            res.redirect('/user/'+req.user._id)
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
              res.redirect('/user/'+req.user._id)
        }
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
        res.send(req.user._id)
        //res.redirect('/user/'+req.user._id)
      }
    }
    );
  app.post('/login', passport.authenticate("local-login", {
    failureRedirect: '/',
    failureFlash: true
  }),
    function (req, res){
      if (req.user){
        res.send(req.user._id)
        //res.redirect('/user/'+req.user._id)
      }
    }
  );
  // POST logout
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect(req.get('referer'));  // Redirect back to same page
  });

  app.get('*', function(req, res){
      res.redirect('/error')
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

  function getUserId(req) {
    if (req.user) {
      return req.user._id
    }
  }
}
