// dao/userSqlMapping.js
// CRUD SQL语句
var article = {
    insert:'INSERT INTO article(title, body, published, tags, summary, description, keywords) VALUES(?,?,?,?,?,?,?)',
    update:'update article set title=?, body=? where id=?',
    delete: 'delete from article where id=?',
    queryById: 'select * from article where id=?',
    queryAll: 'select * from article order by published desc limit ?,?',
    countAll: 'select count(*) as count from article',
    queryNearly: 'select * from article order by published desc limit 3',
    queryHot: 'select * from article order by track desc limit 10',
    queryTag: 'select * from article where tags like ? order by published desc limit ?,?',
    countTag: 'select count(*) as count from article where tags like ?',
    track:'update article set track=? where id=?'
};

module.exports = article;
