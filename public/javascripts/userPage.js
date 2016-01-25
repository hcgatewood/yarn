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
    	//if (id in user.following) make button certain color

    $('.follow_btn').on('click', function (e){
		e.preventDefault();

    	var $this = $(this);
	    $this.toggleClass('.follow-toggle btn-primary');
	    if(!$this.hasClass('.follow-toggle')){
	        $this.text('Follow');
	        $this.removeClass('btn-primary2') 

	        $.ajax({
		    url: "/unfollow",
		    type:"POST",
		    data:{submit:true, page_id:page_id, id:id} 
	    	})

	    }
	    else {
	        $this.text('Following');
	        $this.addClass('btn-primary2')

	        $.ajax({
		    url: "/follow",
		    type:"POST",
		    data:{submit:true, page_id:page_id, id:id}
			})
	    }
    });
});

