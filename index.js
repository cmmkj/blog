const path = require('path')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const config = require('config-lite')
const routes = require('./routes')
const pkg = require('./package')
//日志相关模块
const winston = require('winston')
const expressWinston = require('express-winston')

let app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))

//session中间件
app.use(session({
  name: config.session.key,   //设置cookie中保存session id的字段名称
  secret: config.session.secret,  //通过secret来计算hash值并放在cookie中
  cookie: {
    maxAge: config.session.maxAge //过期时间，过期后cookie中的session id自动删除
  },
  store: new MongoStore({ //将session存储到mongodb
    url: config.mongodb //mongodb地址
  })
}))

app.use(flash())  //flash中间件来显示通知

//设置全局模板变量
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
}
//添加三个模板必须的三个变量
app.use((req, res, next) => {
  res.locals.user = req.session.user
  res.locals.success = req.flash('success').toString()
  res.locals.error = req.flash('error').toString()
  next()
})
//处理表单及上传的中间件
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'public/img'),  //上传文件目录
  keepExtension: true   //保留后缀
}))

/*
//正常请求日志放在路由前面
app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}))
*/
routes(app)
/*
//错误请求日志放在路由后面
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}))
*/
app.use((err, req, res, next) => {
  res.render('error', {
    error: err
  })
}) 
/*
app.listen(config.port, () => {
  console.log(`${pkg.name} listening on port ${config.port}`)
})
*/
if(module.parent){
  module.exports = app  //如果index.js被require了，则导出app
}else{
  app.listen(config.port, function(){
    console.log(`${pkg.name} listening on port ${config.port}`)
  })
}



