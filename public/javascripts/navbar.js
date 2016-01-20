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

$('.lg').click(function(e){
	e.preventDefault();
	$.ajax({
		url: "/login",
		type:"POST",
		data:{username: $('#us').val(), password:$('#pass').val()}
	}).done(function(){window.location='/find'});
});

$('.sp').click(function(e){
	e.preventDefault();
	$.ajax({
		url: "/signup",
		type:"POST",
		data:{username: $('#us').val(),password:$('#pass').val()}
	}).done(function(){window.location='/find'});

});

});
