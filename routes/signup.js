const express = require('express')
const sha1 = require('sha1')
const path = require('path')
let router = express.Router()

let UserModel = require('../models/users')
let checkNotLogin = require('../middlewares/check').checkNotLogin

//注册页
router.get('/', checkNotLogin, (req, res, next) => {
  res.render('signup')
})

//用户注册
router.post('/', checkNotLogin, (req, res, next) => {
  let name = req.fields.name
  let gender = req.fields.gender
  let bio = req.fields.bio
  let avatar = req.files.avatar.path.split(path.sep).pop()
  let password = req.fields.password
  let repassword = req.fields.repassword
  //检查参数
  try {
    if(!(name.length >= 1 && name.length <= 10)) {
      throw new Error('名字限制在１－1０个字符')
    }
    if(['m', 'f', 'x'].indexOf(gender) === -1){
      throw new Error('性别只能是m,f或x')
    }
    if(!(bio.length >= 1 && bio.length <= 100)) {
      throw new Error('个人简介限制在１－10０个字符')
    }
    if(!req.files.avatar.name) {
      throw new Error('缺少头像')
    }
    if(password.length < 6){
      throw new Error('密码至少６个字符')
    }
    if(password !== repassword){
      throw new Error('两次输入密码不一致')
    }
  }catch (e) {
    req.flash('error', e.message);
    return res.redirect('/signup')
  }

  //密码加密
  password = sha1(password)

  //写入数据库的用户信息
  let user = {
    name: name,
    password: password,
    gender: gender,
    bio: bio,
    avatar: avatar
  }
  //写入用户信息
  UserModel.create(user)
    .then( result => {
      let user = result.ops[0]
      delete user.password
      req.session.user = user
      req.flash('success', '注册成功')
      res.redirect('/posts')
    })
    .catch(err => {
      if(err.message.match('E11000 duplicate key')){
        req.flash('error', '用户名已被占用')
        return res.redirect('./signup')
      }
      next(err)
    })
})

module.exports = router


