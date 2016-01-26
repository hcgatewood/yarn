var ObjectID = require('mongodb').ObjectID;

module.exports = function (app, passport) {
  var Room = app.models.room;
  var Story = app.models.story;
  var User = app.models.user;
  var bootstrapSync = require('../config/bootstrapSync')(app);
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
    User.find({}, function (err, users){
    res.render('find', {
      title:'Find a Story!',
      username: username,
      id: id,
      users: users,
      startWriting: true,
      user: req.user
     });
    });
  });

  // GET user page
  app.get('/user/:id', upload.single('image'),function (req, res, next) {
    var id=getUserId(req);
    var page_id=req.params.id
    var username = getUsername(req);
    var user_since = getInsertDate(req);
    var belongs_to_user = (id==page_id);

    //redirects to 404 page
    if(!(ObjectID.isValid(page_id))){
      res.redirect('/error')
    }
  User.getPageUsername(page_id, function (page_username){
    User.getFollowingUsername(page_id, function (followingIds) {
      User.getFollowerUsername(page_id, function (followerIds){
        User.follows(id, page_id, function (bool){
        res.render('user_page', {
          title: 'Rolling Story',
          username: username,
          page_username: page_username,
          id: id,
          follows: bool, 
          follow: followingIds,
          follower: followerIds,
          page_id: page_id,
          user: req.user,
          belongs_to_user: belongs_to_user,
          user_since: user_since,
          startWriting: true
          })
         });   
        });
      })
    })
  })     


  // app.post('/follow', function(req,res){
  //   var id= getUserId(req);
  //   var page_id=req.body.page_id

  //     if (req.body.submit){
  //       User.findById(id, function (err, user) {
  //         User.findById(page_id, function (err, page_user){
  //           user.addFollow(page_id, function (err){
  //             if (err) throw err
  //           }) 
  //           page_user.addFollower(id, function (err){
  //             if (err) throw err
  //           })
  //       });
  //     });

  //   }
  // });

  //   app.post('/unfollow', function(req,res){
  //   var id= getUserId(req);
  //   var page_id=req.body.page_id

  //     if (req.body.submit){
  //       User.findById(id, function (err, user) {
  //         User.findById(page_id, function (err, page_user){
  //           user.removeFollow(page_id, function (err){
  //             if (err) throw err
  //           }) 
  //           page_user.removeFollower(id, function (err){
  //             if (err) throw err
  //           })
  //       });
  //     });

  //   }

  // })

  // GET story by id
  app.get('/stories/:storyId', function (req, res, next) {
    var storyId = req.params.storyId;
    var username = getUsername(req);
    console.log('about to get story text...');
    Story.getStoryText(storyId, function (storyText) {
      res.render('story', {
        title: 'Story',
        storyText: storyText,
        username: username,
        startWriting: true,
        user: req.user
      });
    }, function () {
      res.redirect('/error');
    });
  });

  // GET room page
  app.get('/rooms/:roomName', function (req, res, next) {
    var roomName = req.params.roomName;
    var username = getUsername(req);
    var id = getUserId(req);
    var userId = typeof req.user !== 'undefined' ? req.user.id : '';
    Room.requireRoom(roomName, function (room, story) {
      var currentWriterId = room.orderedWriters[0];
      var isUserTurn = (typeof currentWriterId !== 'undefined') &&
        (userId == currentWriterId);
      var isWriter = false;
      for (var idx = 0; idx < room.orderedWriters.length; idx++) {
        if (room.orderedWriters[idx] == userId) isWriter = true;
      }
      console.log('is user turn, is writer:', isUserTurn, isWriter);
      // render the room
      res.render('room', {
        title: roomName,
        contributions: story.orderedContributions,
        username: username,
        storyId: story.id,
        roomId: room.id,
        roomInterval: room.turnLenMs,
        userId: userId,
        id: id,
        user: req.user,
        recentStory: room.recentlyPublishedStoryId,
        startWriting: true,
        isWriter: isWriter,
        isUserTurn: isUserTurn
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
