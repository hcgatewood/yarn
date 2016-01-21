$(document).ready(function(){
	$(".learn_more").click(function() {
    $('html, body').animate({
        scrollTop: $(".responsive-layer").offset().top
    }, 1000);
});
});