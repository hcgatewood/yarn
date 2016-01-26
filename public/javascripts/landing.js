$(document).ready(function(){
  $(".learn_more").click(function() {
    var navHeight = 55;
    $('html, body').animate({
        scrollTop: $(".responsive-layer").offset().top - navHeight
    }, 1000);
});
});
