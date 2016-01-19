$(document).ready(function(){
	$(".overlay, #modal, #modal2").hide();
	$(".signin").click(function(){
		$(".overlay, #modal").show();
	});
	$(".glyphicon-remove").click(function(){
		$(".overlay, #modal, #modal2").hide();
	});
	$("#login_footer").click(function(){
		$("#modal").hide();
		$(".overlay, #modal2").show();
	});

});