$(document).ready(function() {

    $('.tabs .tab-links a').on('click', function(e)  {
        var currentAttrValue = $(this).attr('href');
 
        // Show/Hide Tabs
        $('.tabs ' + currentAttrValue).show().siblings().hide();
 
        // Change/remove current tab to active
        $(this).parent('li').addClass('active').siblings().removeClass('active');
 
        e.preventDefault();
    });

    $('.follow_btn').click(function(){
    var $this = $(this);
    $this.toggleClass('.follow-toggle btn-primary');
    if(!$this.hasClass('.follow-toggle')){
        $this.text('Follow');
        $this.removeClass('btn-primary2')         
    } else {
        $this.text('Following');
        $this.addClass('btn-primary2')

    }
});
});

