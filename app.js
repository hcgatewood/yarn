var express = require('express');
var socket_io = require('socket.io');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var db = require('./db-setup.js');
var assert = require('assert');

app.io = require('socket.io')();

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

app.use('/', routes);
app.use('/users', users);

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

  // Socket listeners
  // Receiving story update
  // TODO: gotta make sure user's allowed to post update, etc.
  socket.on('room contribution', function (data) {
    var roomName = data.roomName;
    var text = data.userContribution;
    console.log('There has been a room contribution');
    console.log('room:', roomName);
    console.log('text:', text);
    db.rooms.update(
      {_id: roomName},
      {$push: {contributions: {user: 'default', text: text}}},
      function (err) {}
    );
    app.io.sockets.emit('story update', data);
  });
});

module.exports = app;
