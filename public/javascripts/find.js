$(document).ready(function () {
  window.onresize = function(event) {
    var win = $(this); //this = window
    if (win.height() >= 820) {
      ('.footer').css({
        position: 'static',
        bottom: 'auto',
        left: 'auto'
      });
      //if (win.width() >= 1280) { [> ... <] }
    }
  }
});
