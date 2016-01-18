// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User = require('../models/user');

// expose this function to our app
module.exports = function (passport) {
  // SESSION SETUP
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  // LOCAL SIGNUP
  passport.use('local-signup',
    new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true  // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
      // asynchronous
      process.nextTick(function () {
        User.findOne({'local.username': username}, function (err, user) {
          if (err) {
            console.log('signup error');
            return done(err);
          }

          // check if there's already a user with that username
          if (user) {
            console.log('username already exists');
            return done(null, false, req.flash(
              'signupMessage', 'That username is already taken.'));
          } else {
            // create a new user
            console.log('creating new user...');
            var newUser = new User();
            newUser.local.username = username;
            newUser.local.password = newUser.generateHash(password);
            newUser.save(function (err) {
              if (err) {
                console.log('user creation error');
                throw err;
              }
              console.log('successfully creating user');
              return done(null, newUser);
            });
          }
        });
      });
    }
  ));

  // LOCAL LOGIN
  passport.use(
    'local-login',
    new LocalStrategy(
      {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
      },
      function (req, username, password, done) {
        User.findOne({'local.username': username}, function (err, user) {
          if (err) {
            console.log('login error');
            return done(err);
          }
          if (!user) {
            return done(null, false, req.flash('loginMessage', 'No user found.'));
          }
          if (!user.validPassword(password)) {
            return done(null, false, req.flash('loginMessage', 'Wrong password'));
          }
          return done(null, user);
        });
      }
    )
  );
};
