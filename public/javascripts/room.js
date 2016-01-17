$(document).ready(function () {
  $('.user-addition-input').textareaAutoSize();

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
      userContribution: userContribution
    }
    socket.emit('room contribution', data);
  });
  // Receiving story updates
  socket.on('story update', function (data) {
    console.log('story update:', data.userContribution);
    var contributionParent = $('.main-story');
    var newContribution = $('.contribution').first().clone()
    newContribution.children('.contribution-username').text('default');
    newContribution.children('.contribution-text').text(data.userContribution);
    contributionParent.append(newContribution);
  })
});


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
