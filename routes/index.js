var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'The Rolling Story' });
});

router.get('/find', function(req,res){
	res.render('find', {title:'Find a Story!'});
});

module.exports = router;
