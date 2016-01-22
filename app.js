var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var db = require('./config/db-setup.js');
var assert = require('assert');
app.io = require('socket.io')();

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

//app.use('/', routes);
//app.use('/users', users);

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

  // Socket listeners
  // Receiving story update
  // TODO: gotta make sure user's allowed to post update, etc.
  socket.on('room contribution', function (data) {
    var roomName = data.roomName;
    var username = data.username;
    var text = data.userContribution;
    console.log('There has been a room contribution');
    console.log('room:', roomName);
    console.log('user:', username);
    console.log('text:', text);
    db.rooms.update(
      {_id: roomName},
      {$push: {contributions: {user: username, text: text}}},
      function (err) {}
    );
    app.io.sockets.emit('story update', data);
  });
});

module.exports = app;

//User Upload Files
var express = require("express"),
    app = express(),
    formidable = require('formidable'),
    util = require('util'),
    fs   = require('fs-extra'),
    qt   = require('quickthumb');

// Use quickthumb
app.use(qt.static(__dirname + '/'));

app.post('/upload', function (req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    res.writeHead(200, {'content-type': 'text/plain'});
    res.write('received upload:\n\n');
    res.end(util.inspect({fields: fields, files: files}));
  });

  form.on('end', function(fields, files) {
    /* Temporary location of our uploaded file */
    var temp_path = this.openedFiles[0].path;
    /* The file name of the uploaded file */
    var file_name = this.openedFiles[0].name;
    /* Location where we want to copy the uploaded file */
    var new_location = 'uploads/';

    fs.copy(temp_path, new_location + file_name, function(err) {  
      if (err) {
        console.error(err);
      } else {
        console.log("success!")
      }
    });
  });
});

// Show the upload form 
app.get('/', function (req, res){
  res.writeHead(200, {'Content-Type': 'text/html' });
  var form = '<form action="/upload" enctype="multipart/form-data" method="post">Add a title: <input name="title" type="text" /><br><br><input multiple="multiple" name="upload" type="file" /><br><br><input type="submit" value="Upload" /></form>';
  res.end(form); 
}); 
app.listen(8080);

