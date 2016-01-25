$(document).ready(function () {
  $('.user-addition-input').textareaAutoSize();
  console.log('###', isUserTurn);
  handleUserTurn();
  handleWriterStatus();

  var pathname = window.location.pathname;
  var roomName = _.last(pathname.split('/'));
  console.log('ready user id:', userId);

  var socket = io();
  socket.emit('join room', {
    room: roomName,
    roomId: roomId,
    userId: userId
  });

  // join the story as a writer/waiter
  $('.join-room').click(function () {
    console.log('join as writer');
    isWriter = true;
    handleWriterStatus();
    socket.emit('join as writer', {
      roomId: roomId,
      userId: userId
    });
  });
  // leave the story as a writer/waiter
  $('.leave-room').click(function () {
    console.log('leave as writer');
    isWriter = false;
    isUserTurn = false;
    handleWriterStatus();
    handleUserTurn();
    socket.emit('leave as writer', {
      roomId: roomId,
      userId: userId
    });
  });

  // reduce room's num users on leaving the page; stolen from
  // http://stackoverflow.com/questions/7080269/javascript-before-leaving-the-page
  $(window).bind('beforeunload', function () {
    socket.emit('leaving room', {
      roomId: roomId,
      userId: userId
    });
  })

  // adding to the story
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
      roomId: roomId,
      storyId: storyId,
      userId: userId,
      username: username,
      userContribution: userContribution
    }
    socket.emit('room contribution', data);
  });

  socket.on('turn update', function (data) {
    console.log('TURN UPDATE:', data.orderedWriters);
    var tmp = (userId !== '' && data.orderedWriters[0] == userId);
    isUserTurn = tmp;
    handleUserTurn();
    // update isWriter
    isWriter = false;
    for (var idx = 0; idx < data.orderedWriters.length; idx++) {
      if (data.orderedWriters[idx] == userId) isWriter = true;
    }
    handleWriterStatus();
  });
  socket.on('new story', function (data) {
    storyId = data.storyId;
    $('.contribution').not('.empty').remove();
  });
  // receiving story updates
  socket.on('story update', function (data) {
    console.log('story update:', data.userContribution);
    // add new element
    var contributionParent = $('.main-story');
    var newContribution = $('.contribution').first().clone()
    newContribution.removeClass('empty');
    newContribution.children('.contribution-username').text(data.username);
    newContribution.children('.contribution-text').text(data.userContribution);
    contributionParent.append(newContribution);
    // scroll to bottom of page
    var nearBottom = nearBottomOfPage();
    if (nearBottom) {
      $('html, body').animate(
        {scrollTop: $(document).height()},
        'slow'
      );
    }
  });

});


function handleWriterStatus() {
  if (userId == '') {
    $('.visible-as-writer').hide();
    $('.invisible-as-writer').hide();
  } else if (isWriter === true) {
    console.log('YES WRITER');
    $('.visible-as-writer').show();
    $('.invisible-as-writer').hide();
  } else {
    $('.visible-as-writer').hide();
    $('.invisible-as-writer').show();
  }
}
function handleUserTurn() {
  if ((userId !== '') && (isUserTurn === true)) {
    console.log('YES TURN');
    $('.visible-on-turn').show();
  } else {
    $('.visible-on-turn').hide();
  }
}

function nearBottomOfPage() {
  var proximityThreshold = 0;
  var bottomWindow = $(window).scrollTop() + $(window).height();
  var bottomDocument = $(document).height();
  return bottomWindow >= bottomDocument - proximityThreshold;
}
