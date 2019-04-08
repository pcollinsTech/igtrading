var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: '200' });
});


router.get('/policy', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
