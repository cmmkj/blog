
const express = require('express')
const PostModel = require('../models/posts')
let router = express.Router()

let checkLogin = require('../middlewares/check').checkLogin

// 所有用户或者特定用户的文章页
router.get('/', (req, res, next) => {
  res.render('posts')
})

//发表一片文章
router.get('/create', checkLogin, (req, res, next) => {
  res.render('create')
})

//发表文章页面
router.post('/', checkLogin, (req, res, next) => {
  let author = req.session.user._id
  let title = req.fields.title
  let content = req.fields.content

  try {
    if(!title.length) {
      throw new Error('请填写标题')
    }
    if(!content.length) {
      throw new Error('请填写内容')
    }
  }catch(e){
      req.flash('error', e.message)
      return res.redirect('back')
    }
  let post = {
    author: author,
    title: title,
    content: content,
    pv: 0
  }
  PostModel.create(post)
    .then(result => {
      let post = result.ops[0]
      req.flash('success', '发表成功')
      res.redirect(`/posts/${post._id}`)
    })
    .catch(next)
})

//单独一片文章的页面
router.get('/:postId', (req, res, next) => {
  res.send(req.flash())
})

//更新文章页
router.get('/:postId/edit', checkLogin, (req, res, next) => {
  res.send(req.flash())
})

//更新文章
router.post('/:postId/edit', checkLogin, (req, res, next) => {
  res.send(req.flash())
})

//删除一片文章
router.get('/:postId/remove', checkLogin, (req, res, next)　=> {
  res.send(req.flash())
})

//创建一条留言
router.post('/:postId/comment', checkLogin, (req, res, next) => {
  res.send(req.flash())
})

//删除一条留言\
router.get('/:postId/comment/:commentId/remove', checkLogin, (req, res, next) => {
  res.send(req.flash())
})


module.exports = router
