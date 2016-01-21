// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
var User = require('../models/user');
// load the auth variables
var configAuth = require('./auth');

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

// FACEBOOK 
 passport.use(new FacebookStrategy({
        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL
    },
    // facebook will send back the token and profile

    function(token, refreshToken, profile, done) {
        process.nextTick(function() {
            // find the user in the database based on their facebook id
            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                // if there is an error, stop everything and return that
                if (err)
                    return done(err);
                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser            = new User();
                    // set all of the facebook information in our user model
                    newUser.facebook.id    = profile.id; // set the users facebook id                   
                    newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
                    newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                    //newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }
            });
        });
    }));

 // GOOGLE 
passport.use(new GoogleStrategy({
        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
    },
    function(token, refreshToken, profile, done) {
        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            // try to find the user based on their google id
            User.findOne({ 'google.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {

                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser          = new User();

                    // set all of the relevant information
                    newUser.google.id    = profile.id;
                    newUser.google.token = token;
                    newUser.google.name  = profile.displayName;
                    newUser.google.email = profile.emails[0].value; // pull the first email

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });

    }));
};
