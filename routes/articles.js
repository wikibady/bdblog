var express = require('express');
var router = express.Router();

var articleDao = require('../dao/articleDao');

var marked = require('marked');
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

console.log(marked('I am using __markdown__.'));

/* GET articles listing. */
router.get('/', function(req, res, next) {
  //res.send('respond with a resource');
    articleDao.queryAll(req, res, next);
});
router.get('/updateArticle', function(req, res, next) {
  //res.send('respond with a resource');
    res.render('updateArticle');
});

// 增加用户
//TODO 同时支持get,post
router.get('/addArticle', function(req, res, next) {
    //articleDao.add(req, res, next);
    var date = new Date();
    res.render('addArticle',{nowDate:date});
});


router.get('/queryAll', function(req, res, next) {
    articleDao.queryAll(req, res, next);
});

router.get('/query', function(req, res, next) {
    articleDao.queryById(req, res, next);
});

router.get('/deleteArticle', function(req, res, next) {
    articleDao.delete(req, res, next);
});

router.post('/updateArticle', function(req, res, next) {
    articleDao.update(req, res, next);
});
router.post('/addArticle', function(req, res, next) {
    articleDao.add(req, res, next);
});

router.get('/md', function(req, res, next) {
  //res.send('respond with a resource');
    res.render('md');
});
router.get('/*', function(req, res) {
  //res.send('respond with a resource');
    res.render('404');
});
module.exports = router;
