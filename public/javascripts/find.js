
$(document).ready(function(){
  if (typeof id === 'undefined') id = '';

  $('.autoplay').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  });


  for (var idx = 0; idx<users.length; idx++){
    //console.log("")
    var url=users[idx]["_id"]
    var rand=Math.floor(Math.random() * 9) + 1 
    if (users[idx]["local"]){
      var name=users[idx]["local"]["username"]
    }
    else if (users[idx]["google"]){
      var name=users[idx]["google"]["name"]
    }
    else if (users[idx]["google"]){
      var name=users[idx]["google"]["name"]
    }
 
  if (idx%4==0) {
      if(url==id){
       $('.one').append("<a href='/user/"+url+"'><div class='block1'><img src='../siteArt/userYarn"+rand+".svg'>"+"You!"+"</img></div>") 
      }
      else{
      $('.one').append("<a href='/user/"+url+"'><div class='block1'><img src='../siteArt/userYarn"+rand+".svg''>"+name+"</img></div>")
        }
      }
      if (idx%4==1) {
        $('.two').append("<a href='/user/"+url+"'><div class='block1'><img src='../siteArt/userYarn"+rand+".svg''>"+name+"</img></div>")
      }
      if (idx%4==2) {
        $('.three').append("<a href='/user/"+url+"'><div class='block1'><img src='../siteArt/userYarn"+rand+".svg''>"+name+"</img></div>")
      }
      if (idx%4==3) {
        $('.four').append("<a href='/user/"+url+"'><div class='block1'><img src='../siteArt/userYarn"+rand+".svg''>"+name+"</img></div>")
      }
  }
  
});

