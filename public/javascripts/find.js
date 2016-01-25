
$(document).ready(function(){
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

  $('.autoplay').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  });


  for (var idx = 0; idx<users.length; idx++){
    var url=users[idx]["_id"]
    var name=users[idx]["username"]
    if (idx%4==0) {
      if(url==id){
       $('.one').append("<a href='/user/" + url + "'><div class='block1'><span class='name'>"+"You!"+"</span></div>") 
      }
      else{
      //$('.row .friends').append("<div class=''><div class='block1'></div></div>")
      $('.one').append("<a href='/user/" + url + "'><div class='block1'>"+name+"</div>")
      }
    }
    if (idx%4==1) {
      $('.two').append("<a href='/user/" + url + "'><div class='block2'>"+name+"</div>")
      //$('.col-lg-3').append("<div class='block2'></div>")
    }
    if (idx%4==2) {
      $('.three').append("<a href='/user/" + url + "'><div class='block3'>"+name+"</div>")
      //$('.row .friends').append("<div class='col-lg-3'><div class='block3'></div></div>")
    }
    if (idx%4==3) {
      $('.four').append("<a href='/user/" + url + "'><div class='block4'>"+name+"</div>")
      //$('.row .friends').append("<div class='col-lg-3'><div class='block4'></div></div>")
    }
  }
  
});

