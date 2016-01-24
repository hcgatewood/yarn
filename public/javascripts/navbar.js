$(document).ready(function(){
  $(".overlay, .modal").hide();
  $(".signin").click(function(){
    $(".overlay, #modal1").show();
  });
  $(".glyphicon-remove").click(function(){
    $(".overlay, .modal").hide();
  });
  $("#login_footer").click(function(){
    $("#modal1").hide();
    $(".overlay, #modal2").show();
  });

  $('.lg').click(function(e){
    e.preventDefault();
    $.ajax({
      url: "/login",
      type:"POST",
      data:{username: $('#us').val(), password:$('#pass').val(), _id: _id},
    }).done(function (id){window.location='/user/'+id});
  });

  $('.sp').click(function(e){
    e.preventDefault();
    $.ajax({
      url: "/signup",
      type:"POST",
      data:{username: $('#us').val(),password:$('#pass').val()},
    }).done(function (id){window.location='/user/'+id});
  });

  // close overlay with <esc>
  var escCode = 27;
  $(document).keyup(function (keyEvent) {
    if (keyEvent.keyCode == escCode) {
      $('.overlay, .modal').hide();
    }
  });

});
