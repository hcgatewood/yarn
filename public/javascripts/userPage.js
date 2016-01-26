$(document).ready(function() {
	//var id
	//var page_id
    $('.tabs .tab-links a').on('click', function(e)  {
        var currentAttrValue = $(this).attr('href');
 
        // Show/Hide Tabs
        $('.tabs ' + currentAttrValue).show().siblings().hide();
 
        // Change/remove current tab to active
        $(this).parent('li').addClass('active').siblings().removeClass('active');
 
        e.preventDefault();
    });
    	//if (user_id in page_id.follower) make button certain color
  	var socket = io.connect();

  	$(".follow_btn").click(function (event) {
  		event.preventDefault();
  		var $this = $(this);
  		// Tell the server to follow page
  		if (!follows){
  			//console.log("FOLLOWS")
  			$this.text('Follow');
	 		$this.addClass('btn-primary')
	 		$this.removeClass('btn-primary2') 
	 		console.log(follows)
    		socket.emit('follow', {
    			follows: true,
    			page_id: page_id,
    			id: id
    			});
		}
		else{
		//console.log("UNFOLLOWS")
			$this.text('Following')
    		$this.addClass('btn-primary2')
	 		$this.removeClass('btn-primary') 
  		//Tell the server to unfollow page
  			console.log(follows)
    		socket.emit('unfollow', {
    			follows: false,
    			page_id: page_id,
    			id: id
    			});
    	}
  	});


  //   $('.follow_btn').on('click', function (e){
		// e.preventDefault();

  //   	var $this = $(this);
	 //    //$this.toggleClass('.follow-toggle btn-primary');
	 //    if(!follows){
	 //        $this.text('Follow');
	 //        $this.addClass('btn-primary')
	 //        $this.removeClass('btn-primary2') 

	 //        $.ajax({
		//     url: "/unfollow",
		//     type:"POST",
		//     data:{submit:true, page_id:page_id, id:id,follows:false} 
	 //    	})

	 //    }
	 //    else {
	 //        $this.text('Following');
	 //        $this.addClass('btn-primary2')
	 //        $this.removeClass('btn-primary') 

	 //        $.ajax({
		//     url: "/follow",
		//     type:"POST",
		//     data:{submit:true, page_id:page_id, id:id,follows:true}
		// 	})
	 //    }
  //   });
});

