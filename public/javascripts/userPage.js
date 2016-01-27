$(document).ready(function() {
    $('.tabs .tab-links a').on('click', function(e)  {
        var currentAttrValue = $(this).attr('href');
        // Show/Hide Tabs
        $('.tabs ' + currentAttrValue).show().siblings().hide();
        // Change/remove current tab to active
        $(this).parent('li').addClass('active').siblings().removeClass('active');
        e.preventDefault();
    });

    var socket = io.connect();

    if (follows=='true'){
      $(".follow_btn").text('Following')
      $(".follow_btn").addClass('btn-primary2')
      $(".follow_btn").removeClass('btn-primary')
    } else {
      $(".follow_btn").text('Follow');
      $(".follow_btn").removeClass('btn-primary2')  
      $(".follow_btn").addClass('btn-primary')
    }
    $(".follow_button").click(function (event) {
      var $this = $(".follow_btn")
      event.preventDefault();
      if (follows==='false'){
        follows = 'true'
        $this.text('Following')
        $this.addClass('btn-primary2')
        $this.removeClass('btn-primary')
        socket.emit('follow', {
          follows: follows,
          page_id: page_id,
          id: id,
          follower:follower
              }); }
      else{
        follows = 'false'
        $this.text('Follow');
        $this.addClass('btn-primary')
        $this.removeClass('btn-primary2')
        //Tell the server to unfollow page
          socket.emit('unfollow', {
            follows: follows,
            page_id: page_id,
            id: id,
            follower:follower
            });

        } 

        socket.on('addFollower', function (data){
          console.log(data.num_followers)
          $(".follower").text(data.num_followers);
        })
        socket.on('addFollower', function (data){
          $(".follow").text(data.num_followers);
          $(".follower").text(data.num_followers);
        })    
  });
});

