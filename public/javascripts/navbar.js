$(document).ready(function(){

  $('.search-bar').hide();

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

  //$('sign-in').click(function() {
    //$.ajax({
      //url: '/login',
      //data: {
        //username: $('#us').val(),
        //password: $('#pass').val()
      //}
    //})
  //});

  $('.lg').click(function(e){
    e.preventDefault();
    $.ajax({
      url: "/login",
      type:"POST",
      data: {
        username: $('#us').val(),
        password:$('#pass').val(),
        //_id: _id
      },
    }).done(function (_id){window.location='/rooms/main'});
    //}).done(function (_id){window.location='/user/'+_id});
  });

  $('.sp').click(function(e){
    e.preventDefault();
    $.ajax({
      url: "/signup",
      type:"POST",
      data: {
        username: $('#us').val(),
        password: $('#pass').val()
      },
    }).done(function (_id){window.location='/rooms/main'});
    //}).done(function (_id){window.location='/user/'+_id});
  });

  // close overlay with <esc>
  var escCode = 27;
  $(document).keyup(function (keyEvent) {
    if (keyEvent.keyCode == escCode) {
      $('.overlay, .modal').hide();
    }
  });

});
