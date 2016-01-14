$(document).ready(function () {
  $('.user-addition-input').textareaAutoSize();
  var socket = io();
  $('.main-story').click(function () {
    socket.emit('test msg', 'hi server. love, client.');
  })
  socket.on('we did it reddit', function (msg) {
    console.log(msg);
  })
});
