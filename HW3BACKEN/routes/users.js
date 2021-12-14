const mysql=require("mysql");
const CryptoJS=require("crypto-js")
const config=require("../config");
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
  console.log("ss")
});

var app = express();
// 验证码
var text;
let svgCaptcha=require('svg-captcha');
// cookie
let cookoeParser=require('cookie-parser');
// 启用cookie
app.use(cookoeParser());
// 创建一个验证码
router.get('/verifyCode',(req,res)=>{
    // 创建验证码
    var captcha = svgCaptcha.create({
        color: true, // 彩色
        //inverse:false,// 反转颜色
        width:100, //  宽度
        height:40, // 高度
        fontSize:48, // 字体大小
        size:4, // 验证码的长度
        noise:3, // 干扰线条
        ignoreChars: '0oO1ilI' // 验证码字符中排除 0o1i
    });
    //data是数据 发给前端  text是字符，用于验证
    console.log(captcha.text); //svg 直接输出到页面
    text=captcha.text;
    // session里面也放一份
    req.session=captcha.text.toLowerCase();
    // cookie放一份
    res.cookie('captcha',req.session);
    res.send(captcha.data);
    // 往session，cookie中都存入一个验证码，并且把验证码显示在页面上
})


//将用户信息提交到数据库 id hash salt
router.post('/usrinfo',function(req,res,next){
  var connection = mysql.createConnection(config.options); 
  connection.connect(function(err) { console.log('数据库连接成功！') }); 
  var payload=req.body;
  //从面板获取前端传来的json
  console.log(req.body);
  var id=payload.id;
  var password=payload.hash;
  var salt=payload.salt;
  let todo=[id,password,salt]
  console.log(todo);
  connection.query('INSERT INTO secret(ID,HASH,SALT) VALUES (?,?,?)',todo,function (error, results) {
    if (error) throw error;
    else {          
    return res.json(
      {
        noerr:"信息插入成功！"
      });   
    } 
  })
  connection.end();
  })

//hash256算法
function get_sha256(str, secret) {
  // hmac_sha256加密
  var signature = CryptoJS.HmacSHA256(str, secret);
  signature = CryptoJS.enc.Base64.stringify(signature);
  //console.log(signature);
    return signature;
  } 


//查询用户信息  用户发送登录信息 包括id password code
router.post('/check',function(req,res,next){
  var connection = mysql.createConnection(config.options); 
  connection.connect(function(err) { console.log('数据库连接成功！') }); 
  var payload=req.body;
  var id=payload.id;
  var password=payload.password;
  var code=payload.code;
  console.log(payload)
  console.log(id);
  console.log(password);
  console.log(code);
  console.log("1");
  if(code!=text)
  return res.json(
    {
      noerr:"验证码错误！"
    });
  console.log(text);
  connection.query('select * from secret where id=?',[id],function (error, results) {
      if (error) throw error;
      else{
        console.log(get_sha256(results[0].SALT,password));
        if(results[0].HASH==get_sha256(results[0].SALT,password)){
          return res.json(
            {
              noerr:"登录成功！"
            });
          } else{
            console.log("3");
            return res.json(
              {
                noerr:"账号或密码错误！"
              });
          }
      }
  })

  connection.end();
})

module.exports = router;
