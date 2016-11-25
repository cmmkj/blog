const express = require('express')
let router = express.Router()

let checkLogin = require('../middlewares/check').checkLogin

//登录页
router.get('/', checkLogin, (req, res, next) => {
  req.session.user = null
  req.flash('success', '登出成功')
  res.redirect('/posts')
})


module.exports = router



