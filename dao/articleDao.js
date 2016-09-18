// dao/articleDao.js
// 实现与MySQL交互
var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');
var $sql = require('./articleSqlMapping');

// 使用连接池，提升性能
var pool  = mysql.createPool($util.extend({}, $conf.mysql));

// 向前台返回JSON方法的简单封装
var jsonWrite = function (res, ret) {
    if(typeof ret === 'undefined') {
        res.json({
            code:'1',
            msg: '操作失败'
        });
    } else {
        res.json(ret);
    }
};

module.exports = {
    add: function (req, res, next) {
        pool.getConnection(function(err, connection) {
            // 获取前台页面传过来的参数
            var param = req.body || req.query || req.params;

            // 建立连接，向表中插入值
            // 'INSERT INTO article(id, name, age) VALUES(0,?,?)',
            connection.query($sql.insert, [param.title, param.body, param.published, param.tags,param.summary,param.description,param.keywords], function(err, result) {
                if(result) {
                    result = {
                        code: 200,
                        msg:'增加成功'
                    };
                    res.render('suc',{
                        result:result
                    })
                }
                else {
                    res.render('fail',{
                        result:err
                    })
                }
                // 以json形式，把操作结果返回给前台页面
                jsonWrite(res, result);

                // 释放连接
                connection.release();
            });
        });
    },
    delete: function (req, res, next) {
        // delete by Id
        pool.getConnection(function(err, connection) {
            var id = +req.query.id;
            connection.query($sql.delete, id, function(err, result) {
                if(result.affectedRows > 0) {
                    result = {
                        code: 200,
                        msg:'删除成功'
                    };

                } else {
                    result = void 0;
                }
                jsonWrite(res, result);
                connection.release();
            });
        });
    },
    update: function (req, res, next) {
        // update by id
        // 为了简单，要求同时传name和age两个参数
        var param = req.body;
        if(param.title == null || param.body == null || param.id == null) {
            jsonWrite(res, undefined);
            return;
        }

        pool.getConnection(function(err, connection) {
            connection.query($sql.update, [param.title, param.body, +param.id], function(err, result) {
                // 使用页面进行跳转提示
                if(result.affectedRows > 0) {
                    res.render('suc', {
                        result: result
                    }); // 第二个参数可以直接在jade中使用
                } else {
                    res.render('fail',  {
                        result: result
                    });
                }

                connection.release();
            });
        });

    },
    queryById: function (req, res, next) {
        var id = +req.query.id; // 为了拼凑正确的sql语句，这里要转下整数

        pool.getConnection(function(err, connection) {
            var article;
            var track;
            var hotarticles;
            var title;
            connection.query($sql.queryById, id, function(err, result) {
                for(var i = 0;i<result.length;i++){
                    var date = result[i].published.getFullYear() + '-' + (result[0].published.getMonth()+1) + '-' + result[0].published.getDate();
                    result[i].date = date;
                }
                article = result[0];
                track = result[0].track+1;
                title = result[0].title;
                connection.query($sql.queryHot, function(err, result) {
                    //res.send(result)

                    for(var i = 0;i<result.length;i++){
                        var date = result[i].published.getFullYear() + '-' + (result[i].published.getMonth()+1) + '-' + result[i].published.getDate();
                        result[i].date = date;
                        var tags = result[i].tags.split(';');
                        result[i].tags = tags;
                    }
                    hotarticles = result;
                });
                connection.query($sql.track, [track,id], function(err, result) {
                    res.render('Article',  {
                        title: title + " - 后时代",
                        article: article,
                        hotarticles:hotarticles
                    });
                    connection.release();
                });

            });
        });
    },
    queryAll: function (req, res, next) {

        pool.getConnection(function(err, connection) {
            var articles,
                hotarticles,
                page = parseInt(req.query.page),
                count,
                tag = req.query.tag,
                tag0;
            if(!page || typeof(page) !== 'number'){
                page = 1;

            }

            console.log(tag)
            if(!tag){//非tag筛选
                //分页
                connection.query($sql.countAll,function(err, result) {
                    count = result[0].count;
                });
                connection.query($sql.queryAll, [(page-1)*10,10],function(err, result) {
                    //res.send(result)
                    for(var i = 0;i<result.length;i++){
                        var date = result[i].published.getFullYear() + '-' + (result[i].published.getMonth()+1) + '-' + result[i].published.getDate();
                        result[i].date = date;
                        var tags = result[i].tags.split(';');
                        for(var j = 0;j<tags.length;j++){
                            if(tags[j]==""||tags[j]==" "){
                                tags.pop();
                            }
                        }
                        result[i].tags = tags;
                    }
                    articles = result;
                });
            }
            else{//tag筛选
                tag0 = decodeURI(tag);
                tag='%'+decodeURI(tag)+'%';
                //分页
                connection.query($sql.countTag,tag,function(err, result) {
                    console.log(result)
                    count = result[0].count;
                });
                connection.query($sql.queryTag, [tag,(page-1)*10,10],function(err, result) {
                    //res.send(result)
                    for(var i = 0;i<result.length;i++){
                        var date = result[i].published.getFullYear() + '-' + (result[i].published.getMonth()+1) + '-' + result[i].published.getDate();
                        result[i].date = date;
                        var tags = result[i].tags.split(';');
                        for(var j = 0;j<tags.length;j++){
                            if(tags[j]==""||tags[j]==" "){
                                tags.pop();
                            }
                        }
                        result[i].tags = tags;
                    }
                    articles = result;
                });
            }
            connection.query($sql.queryHot, function(err, result) {
                //res.send(result)
                for(var i = 0;i<result.length;i++){
                    var date = result[i].published.getFullYear() + '-' + (result[i].published.getMonth()+1) + '-' + result[i].published.getDate();
                    result[i].date = date;
                    var tags = result[i].tags.split(';');
                    for(var j = 0;j<tags.length;j++){
                        if(tags[j]==""||tags[j]==" "){
                            tags.pop();
                        }
                    }
                    result[i].tags = tags;
                }
                hotarticles = result;
                connection.release();
                res.render('allArticle',  {
                    title: '后时代 - 前端小叔杂居',
                    articles: articles,
                    hotarticles:hotarticles,
                    page:page,
                    pageAll:Math.ceil(count/10),
                    tag:tag0
                });
            });

        });
    }

};
