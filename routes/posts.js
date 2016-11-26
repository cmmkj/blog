
const express = require('express')
const PostModel = require('../models/posts')
const UserModel = require('../models/users')
const CommentModel = require('../models/comments')
let router = express.Router()

let checkLogin = require('../middlewares/check').checkLogin

// 所有用户或者特定用户的文章页
router.get('/', (req, res, next) => {
//  res.render('posts')
  let author = req.query.author
  PostModel.getPosts(author) 
    .then(posts => {
      res.render('posts', {
        posts: posts
      })
    })
    .catch(next) 
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
  let {name, bio, avatar, gender} = req.session.user

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
    naem: name,
    avatar: avatar,
    gender: gender,
    bio: bio,
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
  let postId = req.params.postId
  Promise.all([
    PostModel.getPostById(postId),
    CommentModel.getComments(postId),
    PostModel.incPv(postId) //阅读量加１
  ])
  .then(result => {
    let post = result[0]
    let comments = result[1]
    if(!post){
        throw new Error('文章不存在')
    }
    res.render('post', {
      post: post,
      comments: comments
    })
  })
  .catch(e => {
    next()
  })
})

//更新文章页
router.get('/:postId/edit', checkLogin, (req, res, next) => {
  let postId = req.params.postId
  let author = req.session.user._id
  
  PostModel.getRawPostById(postId)
    .then(post => {
      if(!post){
        throw new Error('该文章不存在')
      }
      if(author.toString() !== post.author._id.toString()){
        throw new Error('权限不足')
      }
      res.render('edit', {
        post: post
      })
    })
    .catch(next)
})

//更新文章
router.post('/:postId/edit', checkLogin, (req, res, next) => {
  let postId = req.params.postId
  let author = req.session.user._id
  let title = req.fields.title;
  let content = req.fields.content

  PostModel.updatePostById(postId, author, {title: title, content: content})
    .then(() => {
      req.flash('success', '编辑文章成功')
      res.redirect(`/posts/${postId}`)
    })
    .catch(next)
})

//删除一片文章
router.get('/:postId/remove', checkLogin, (req, res, next)　=> {
  let postId = req.params.postId
  let author = req.session.user._id
  PostModel.delPostById(postId, author)
    .then(() => {
      req.flash('success', '删除文章成功')
      res.redirect('/posts')
    })
    .catch(next)
})

//创建一条留言
router.post('/:postId/comment', checkLogin, (req, res, next) => {
  let author = req.session.user._id
  let postId = req.params.postId
  let content = req.fields.content
  let comment = {
    author,
    postId,
    content 
  }
  CommentModel.create(comment)
    .then(() => {
      req.flash('success', '留言成功') 
      res.redirect('back')
    }) 
    .catch(next) 
})

//删除一条留言\
router.get('/:postId/comment/:commentId/remove', checkLogin, (req, res, next) => {
  let commentId = req.params.commentId
  let author = req.session.user._id
  CommentModel.delCommentById(commentId, author)
    .then(() => {
      req.flash('success', '删除留言')
      res.redirect('back')
    })
    .catch(next)
})


module.exports = router
