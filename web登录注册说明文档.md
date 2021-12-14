# WEB 登录注册功能实现

## 技术栈

**Ajax、Node.js、Express、Mysql**

## 运行环境

前端：HTML+CSS+JS 。

**在Vscode中 选择Open with Live Server**

后端：Express、Nodejs

```
npm install //安装相关依赖
cd HW3BACKENED
npm start //启动服务端
```

## 功能介绍

1、实现了登录验证码（前端+后端）

2、实现密码强度（采用了正则表达式）（前端）

3、实现了密码加密及认证（前端+后端+数据库）

## 效果展示

+ 前端展示

![image-20211214104436102](C:\Users\12451\AppData\Roaming\Typora\typora-user-images\image-20211214104436102.png)

![image-20211214105113824](C:\Users\12451\AppData\Roaming\Typora\typora-user-images\image-20211214105113824.png)

+ 服务端展示（刚刚创建的一个账号）

  ![image-20211214105727170](C:\Users\12451\AppData\Roaming\Typora\typora-user-images\image-20211214105727170.png)

+ 服务端展示

![image-20211214105526990](C:\Users\12451\AppData\Roaming\Typora\typora-user-images\image-20211214105526990.png)

## 重要过程实现

### 验证码

在服务端采用```svg-captcha```创建验证码，将svg发送到前端。前端识别验证码，发送信息到后端，进行判断是否正确。利用``session``进行交互

**服务端**

```js
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
```

**前端**

```js
    function getVerify(){
        $.ajax({
            url:'http://localhost:3000/users/verifyCode',
            type:'get',
            dataType:"text",
            success:function(data){
                $('#verify').html(data);//获取后端发送来的svg 并添加到前端
            },
            error:function(err){
                console.log("网络异常!")
            }
        })
    }
    getVerify()
    $('#verify').on('click',function(){//点击图片刷新验证码
        getVerify()
    })
```

### 密码强度

纯前端，比较简单。获取用户输入的内容，采用**正则表达式**进行密码强度判断（由于css部分过长，只贴核心部分，详情可见代码）

```html
<form action="" method="get">
    <input id="id" type="text"placeholder="请输入邮箱" required/>
    <input type="password" name=""  placeholder="请输入密码"oninput="passValidate(this)" 	id="inputPwd" value="" required> 									
    <input id="enpassword" type="password" placeholder="请再次输入密码" required/>			
    <p>请至少使用字母、数字、符号两种类型组合的密码，长度为6~20位。</p>
    <ul class="pwdStrength">
        <li class="weak"></li>
        <li class="middle"></li>
        <li class="strong"></li>
        <li class="result"></li>
    </ul>
    <button id="btn_submit"type="submit">注册</button>					
</form>	
```

```js

		var strongRegex = new RegExp("^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
		//密码为七位及以上并且字母、数字、特殊字符三项中有两项，强度是中等
		var mediumRegex = new RegExp("^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
		var enoughRegex = new RegExp("(?=.{6,}).*", "g");

```

### 注册及加密实现

具体的流程是：

用户注册时：

 1、用户在网站注册时提供ID与口令

 2、系统为用户分配盐值

 3、盐值插入口令后进行HASH**（SHA-256）**

 4、将ID，HASH值与盐值存入数据库

身份验证时：

 1、用户提供ID与口令

2、系统在数据库中通过用户提供的ID查找HASH值与盐值 

3、将盐值插入用户提供的口令后进行HASH 

4、将HASH值与数据库中的HASH值比较，相等则验证成功，反之验证失败

+ 在注册端，我们定义一个函数随机生成盐

  ```js
  //创建一个function用来生成盐
  function randomstr(length){
      return CryptoJS.lib.WordArray.random(16).words[0].toString()
  }
  ```

+ 注册端 调用**CryptoJS**模块，采用**sha256**加密（在线CDN的方式引入）

  ```js
  //采用sha256加密
  function get_sha256(str, secret) {
  var signature = CryptoJS.HmacSHA256(str, secret);
  signature = CryptoJS.enc.Base64.stringify(signature);
  console.log(signature);
  	return signature;
  }
  ```

+ 将id 、hash后的值、salt提交到后端

  ```js
  //将id、hash、salt提交到后端
  function sendinfo(dataobj){
  	$.ajax({
    type: 'POST',
    url: 'http://localhost:3000/users/usrinfo',
    data: dataobj,
    dataType: 'text',
    success:function(data) {//发送请求成功执行的函数
  		alert("success!"),
          window.location.replace("https://www.runoob.com");
      },
    error:function(err){
                  alert("fail!");
              }
  });}
  ```

+ 服务端将接收到的id hash值 salt存到数据库中

  ```js
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
  ```

+ 用户登录时，服务端接收用户的ID和PASSWORD。从根据ID数据库中取出SALT和Hash值。将Password与salt再次哈希，判断两次值是否相等。返回登录是否成功的信息。

  ```js
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
  ```

## 实验中遇到过的难点及解决方法

### 跨域

后端发送的svg无法加入到前端中去。在后端```app.js```中设置跨域信息。要注意这段代码放在``app.use``前面！！！

```
//跨域设置
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,token,authorization");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});
```

### 异步

我起初在登录时没有获取后端的返回信息。由于异步原因，导致前端的JS函数一直处于等待状态，无法完成页面的跳转。