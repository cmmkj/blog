const express = require('express')
const sha1 = require('sha1')
let router = express.Router()

let UserModel = require('../models/users')
let checkNotLogin = require('../middlewares/check').checkNotLogin

//登录页
router.get('/', checkNotLogin, (req, res, next) => {
  res.render('signin') 
})

//用户登录
router.post('/', checkNotLogin, (req, res, next) => {
  let name = req.fields.name
  let password = req.fields.password
  
  UserModel.getUserByName(name)
    .then(user => {
      if(!user){
        req.flash('error', '用户不存在')
        return res.redirect('back')
      }
      if(sha1(password) !== user.password){
        req.flash('error', '密码错误')
        return res.redirect('back')
      }
      req.flash('success', '登录成功')
      delete user.password
      req.session.user = user
      res.redirect('posts')
    })
    .catch(next)
})


module.exports = router


