const mysql=require("mysql");
const config=require("../config");
// const formidable = require('express-formidable')
var express = require('express');
var router = express.Router();
router.use(express.json());
// router.use(formidable())
router.use(express.urlencoded({ extended: true }))

var app = express();
/* GET home page. */
//定义了 get 这一 HTTP 方法来处理以 GET 方法访问我们服务器地址为 / 时如何进行处理
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});




//2.查询数据库是否链接成功
router.post('/',function(req,res,next){
  var connection = mysql.createConnection(config.options); 
  connection.connect(function(err) { console.log('数据库连接成功！') }); 
  connection.end();
})


module.exports = router;
