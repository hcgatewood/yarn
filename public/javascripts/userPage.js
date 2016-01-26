$(document).ready(function() {
    $('.tabs .tab-links a').on('click', function(e)  {
        var currentAttrValue = $(this).attr('href');
        // Show/Hide Tabs
        $('.tabs ' + currentAttrValue).show().siblings().hide();
        // Change/remove current tab to active
        $(this).parent('li').addClass('active').siblings().removeClass('active');
        e.preventDefault();
    });

  	// $(".user_modal").hide();
  	// $(".yarn_btn").click(function(){
   //  	$(".user_modal").show();
  	// });
  	// $(".close").click(function(){
   //  	$(".user_modal").hide();
  	// });
    // $(".first").click(function(){
    //   $ajax({
    //     url: "/user/:id",
    //     type: "POST"
    //   }).done(function() {
    //     $( this ).addClass( "done" );
    //     });
    //   });


  	var escCode = 27;
  	$(document).keyup(function (keyEvent) {
    if (keyEvent.keyCode == escCode) {
      $('.user_modal').hide();
    }
  });

    	//if (user_id in page_id.follower) make button certain color
  	var socket = io.connect();

    console.log(follows)

    if (follows=='true'){
      $(".follow_btn").text('Following')
      $(".follow_btn").addClass('btn-primary2')
      $(".follow_btn").removeClass('btn-primary')
    } else {
      console.log("IT IS FALSE")
      $(".follow_btn").text('Follow');
      $(".follow_btn").removeClass('btn-primary2')  
      $(".follow_btn").addClass('btn-primary')
    }
    
  	$(".follow_btn").click(function (event) {
      var $this = $(this);
  		event.preventDefault();
  		if (!follows){
        follows = true
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
        $this.text('Follow');
        $this.addClass('btn-primary')
        $this.removeClass('btn-primary2')

        follows = false
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

