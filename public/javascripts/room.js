$(document).ready(function () {
  $('.user-addition-input').textareaAutoSize();
  $('.remaining-turns').hide();
  if ($('.contribution').length === 1) {
    $('.new-story-prompt').show();
  } else {
    $('.new-story-prompt').hide();
  }
  isUserTurn = isUserTurn === 'true';
  isWriter = isWriter === 'true';
  storyIsFinished = false;
  handleUserTurn();
  handleWriterStatus();

  // TODO assign this intentionally
  var secondsLeft = -1;
  var showTime = false;
  var pathname = window.location.pathname;
  var roomName = _.last(pathname.split('/'));
  //console.log('ready user id:', userId);

  // set the timer going
  var timerRefresh = setInterval(function () {
    secondsLeft--;
    updateTimer();
  }, 1000);

  var socket = io();
  socket.emit('join room', {
    room: roomName,
    roomId: roomId,
    userId: userId
  });

  // join the story as a writer/waiter
  $('.join-room').click(function () {
    //console.log('join as writer');
    isWriter = true;
    handleWriterStatus();
    socket.emit('join as writer', {
      roomId: roomId,
      userId: userId,
      username: username
    });
  });
  // leave the story as a writer/waiter
  $('.leave-room').click(function () {
    //console.log('leave as writer');
    isWriter = false;
    isUserTurn = false;
    handleWriterStatus();
    handleUserTurn();
    socket.emit('leave as writer', {
      roomId: roomId,
      userId: userId,
      username: username
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
    //console.log('roomName:', roomName);
    //console.log('storyId:', storyId);
    //console.log('username:', username);
    //console.log('userContribution:', userContribution);
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
    console.log('TURN UPDATE', storyIsFinished);
    if (storyIsFinished === true) return;

    console.log('TURN UPDATE:', data.orderedWriters);
    showTime = (data.writerNames.length > 0);
    //console.log('data:', data);
    //data.recentStory
    updateWriters(data.writerNames);
    updateWaiters(data.waiterNames);
    var tmp = (userId !== '' && data.orderedWriters[0] == userId);
    isUserTurn = tmp;
    handleUserTurn();
    // update isWriter
    isWriter = false;
    for (var idx = 0; idx < data.orderedWriters.length; idx++) {
      if (data.orderedWriters[idx] == userId) isWriter = true;
    }
    // update timers if a time len was sent
    if (typeof data.turnLenMs !== 'undefined') {
      secondsLeft = parseInt(data.turnLenMs/1000, 10);
      updateTimer();
    }
    updateTurnsRemaining(data.remainingTurns);
    handleWriterStatus();
  });
  socket.on('new story', function (data) {
    console.log('NEW STORY');
    storyIsFinished = true;
    isUserTurn = false;
    isWriter = false;
    showTime = false;
    storyId = data.storyId;
    updateTurnsRemaining(0);
    updateTimer(true);
    handleUserTurn();
    handleWriterStatus();
    setTimeout(function () {
      location.reload();
    }, 15*1000);
    //$('.new-story-prompt').show();
    //$('.contribution').not('.empty').remove();
    ////console.log('GETTING NEW STORY:', storyId);
    //$('.recent-story').attr('href', '/stories/' + storyId);
    //storyId = data.storyId;
    ////console.log('reload:', data.reload, data.reload === true);
    //if (data.reload === true) {
      //location.reload();
    //}
  });
  // receiving story updates
  socket.on('story update', function (data) {
    //console.log('story update:', data.userContribution);
    $('.new-story-prompt').hide();
    // add new element
    var contributionParent = $('.main-story');
    var newContribution = $('.contribution').first().clone();
    newContribution.removeClass('empty');
    newContribution.children('.contribution-username').text(data.username);
    newContribution.children('.contribution-text').text(data.userContribution);
    contributionParent.append(newContribution);
    // scroll to bottom of page
    var nearBottom = nearBottomOfPage();
    //console.log('near bottom:', nearBottom);
    if (nearBottom) {
      $('html, body').animate(
        {scrollTop: $(document).height()},
        'slow'
      );
    }
  });

  function updateTimer(overrideBadge) {
    // hide the timer if thing's are looking grim
    if (secondsLeft < 0) {
      showTime = false;
    } else {
    }
    // below stolen from:
    // http://stackoverflow.com/questions/1322732/convert-seconds-to-hh-mm-ss-with-javascript
    var time = (new Date).clearTime().addSeconds(secondsLeft).toString('mm:ss');
    var roomTime = (showTime === true) ? time : '';
    var metaTime = (showTime === true) ? time : 'current writer';
    $('.additions-meta-timer').text(roomTime);
    var badge = $('.writers-panel').first()
      .find('.writers-item').not('.empty').first().find('.badge')
    if (showTime === true || overrideBadge === true) {
      badge.text(metaTime);
    }
  }

});

function updateTurnsRemaining(remainingTurns) {
  $('.remaining-turns').show();
  $('.remaining-turns-number').text(remainingTurns);
}
// updates the writers list with the passed array of writer names
function updateWriters(writerNames) {
  //console.log('writer names:', writerNames);
  $('.writers-item').not('.empty').remove();
  var parent = $('.writers-panel');
  var writerName;
  var newContribution;
  if (writerNames.length === 0) {
    writerName = 'None right now';
    newContribution = $('.writers-item').first().clone();
    newContribution.removeClass('empty');
    newContribution.find('.badge').text(':)');
    newContribution.find('.writer').text(writerName);
    parent.append(newContribution);
  }
  for (var idx = 0; idx < writerNames.length; idx ++) {
    writerName = writerNames[idx];
    newContribution = $('.writers-item').first().clone();
    newContribution.removeClass('empty');
    var badgeText = idx === 0
      ? 'current writer'
      : getOrdinal(idx + 1);
    newContribution.find('.badge').text(badgeText);
    newContribution.find('.writer').text(writerName);
    //console.log('new contribution:');
    //console.log(newContribution);
    parent.append(newContribution);
  }
}
// updates the waiters list with the passed array of waiter names
function updateWaiters(waiterNames) {
  //console.log('waiter names:', waiterNames);
  $('.waiters-item').not('.empty').remove();
  var parent = $('.waiters-panel');
  var waiterName;
  var newContribution;
  for (var idx = 0; idx < waiterNames.length; idx ++) {
    waiterName = waiterNames[idx];
    newContribution = $('.waiters-item').first().clone();
    newContribution.removeClass('empty');
    var badgeText = idx === 0
      ? 'current writer'
      : getOrdinal(idx + 1);
    newContribution.find('.badge').text(badgeText);
    newContribution.find('.writer').text(waiterName);
    //console.log('new contribution:');
    //console.log(newContribution);
    parent.append(newContribution);
  }
}
function handleWriterStatus() {
  if (userId == '') {
    //console.log('NO WRITER');
    $('.visible-as-writer').hide();
    $('.invisible-as-writer').hide();
  } else if (isWriter === true || isUserTurn === true) {
    //console.log('YES WRITER');
    $('.visible-as-writer').show();
    $('.meta-item').css('display', 'block');
    $('.invisible-as-writer').hide();
  } else {
    //console.log('NO WRITER');
    $('.visible-as-writer').hide();
    $('.invisible-as-writer').show();
  }

  //console.log('is:', isUserTurn, isWriter);
  if (isUserTurn === false && isWriter === true) {
    $('.visible-as-writer-not-on-turn').show();
  } else {
    $('.visible-as-writer-not-on-turn').hide();
  }
}
function handleUserTurn() {
  if ((userId !== '') && (isUserTurn === true)) {
    //console.log('YES TURN');
    $('.visible-on-turn').show();
    // scroll to bottom of page
    //$('html, body').animate(
      //{scrollTop: $(document).height()},
      //'slow'
    //);
  } else {
    //console.log('NO TURN');
    $('.visible-on-turn').hide();
  }
}

function nearBottomOfPage() {
  var proximityThreshold = 50;
  var bottomWindow = $(window).scrollTop() + $(window).height();
  var bottomDocument = $(document).height();
  //console.log('bottoms:', bottomWindow, bottomDocument, proximityThreshold);
  return bottomWindow >= bottomDocument - proximityThreshold;
}

// Stolen from:
// http://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number
function getOrdinal(n) {
  var s=["th","st","nd","rd"], v=n%100;
  return n+(s[(v-20)%10]||s[v]||s[0]);
}
