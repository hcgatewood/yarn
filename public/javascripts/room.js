$(document).ready(function () {
  $('.user-addition-input').textareaAutoSize();
  // var username already defined

  var socket = io();

  // Adding to the story
  var textArea = $('.user-addition-input');
  $('.additions-meta-submit').click(function () {
    var pathname = window.location.pathname;
    var roomName = _.last(pathname.split('/'));
    var userContribution = textArea.val()
    textArea.val('');
    var data = {
      roomName: roomName,
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

//// Getting URL parameters. Stolen from
//// http://stackoverflow.com/questions/19491336/get-url-parameter-jquery
//var getUrlParameter = function getUrlParameter(sParam) {
  //var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    //sURLVariables = sPageURL.split('&'),
    //sParameterName,
    //i;

  //for (i = 0; i < sURLVariables.length; i++) {
    //sParameterName = sURLVariables[i].split('=');

    //if (sParameterName[0] === sParam) {
      //return sParameterName[1] === undefined ? true : sParameterName[1];
    //}
  //}
//};
