var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var assert = require('assert');
var io = require('socket.io')();
app.io = io;

var bootstrapSync = require('./config/bootstrapSync');

// db models
var Story = require('./models/story');

// passport
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var configDB = require('./config/database.js')();
app.dbUrl = configDB.url;
var session = require('express-session');
mongoose.connect(app.dbUrl);
app.use(session({
  secret: 'be the reason someone smiles today',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());  // persistent login sessions
require('./config/passport')(passport);  // pass passport for configuration
app.use(flash());  // use connect-flash for flash messages stored in session

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var image = require('./routes/index.js');
    app.use('/index', image);

//app.use('/', routes);
//app.use('/users', users);


// If RELOAD_DB is defined, use it's value, otherwise choose a default value
var reloadDb = typeof process.env.RELOAD_DB !== 'undefined'
  ? process.env.RELOAD_DB == 'true'
  : false;
if (reloadDb) {
  console.log('@@@ RELOADING ROOM DATA');
  bootstrapSync.reloadRoomData();
}

// routes
var routes = require('./routes/index')(app, passport);
var users = require('./routes/users');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// Start listen with socket.io
app.io.on('connection', function (socket) {
  console.log('Socket connection successful.');
  socket.on('join room', function (data) {
    socket.join(data.room);
  })

  // Socket listeners
  // Receiving story update
  // TODO: gotta make sure user's allowed to post update, etc.
  socket.on('room contribution', function (data) {
    console.log('There has been a room contribution');
    console.log('room:', data.roomName);
    console.log('storyId:', data.storyId);
    console.log('user:', data.username);
    console.log('text:', data.userContribution);
    Story.addContribution(data.storyId, data.username, data.userContribution);
    io.to(data.roomName).emit('story update', data);
  });
});

module.exports = app;

