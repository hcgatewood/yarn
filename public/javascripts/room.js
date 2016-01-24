$(document).ready(function () {
  $('.user-addition-input').textareaAutoSize();
  // var username already defined

  var pathname = window.location.pathname;
  var roomName = _.last(pathname.split('/'));

  var socket = io();
  socket.emit('join room', {
    room: roomName,
    roomId: roomId,
    userId: userId
  });

  // Reduce room's num users on leaving the page; stolen from
  // http://stackoverflow.com/questions/7080269/javascript-before-leaving-the-page
  $(window).bind('beforeunload', function () {
    socket.emit('leaving room', {
      roomId: roomId,
      userId: userId
    });
  })

  // Adding to the story
  var textArea = $('.user-addition-input');
  $('.additions-meta-submit').click(function () {
    var userContribution = textArea.val()
    textArea.val('');
    console.log('roomName:', roomName);
    console.log('storyId:', storyId);
    console.log('username:', username);
    console.log('userContribution:', userContribution);
    var data = {
      roomName: roomName,
      storyId: storyId,
      username: username,
      userContribution: userContribution
    }
    socket.emit('room contribution', data);
  });

  // Receiving story updates
  socket.on('story update', function (data) {
    console.log('story update:', data.userContribution);
    var nearBottom = nearBottomOfPage();
    // Add new element
    var contributionParent = $('.main-story');
    var newContribution = $('.contribution').first().clone()
    newContribution.removeClass('empty');
    newContribution.children('.contribution-username').text(data.username);
    newContribution.children('.contribution-text').text(data.userContribution);
    contributionParent.append(newContribution);
    // Scroll to bottom of page
    if (nearBottom) {
      $('html, body').animate(
        {scrollTop: $(document).height()},
        'slow'
      );
    }
  });

});


function nearBottomOfPage() {
  var proximityThreshold = 0;
  var bottomWindow = $(window).scrollTop() + $(window).height();
  var bottomDocument = $(document).height();
  return bottomWindow >= bottomDocument - proximityThreshold;
}
