const path = require('path')
const assert = require('assert')
const request = require('supertest')
const app = require('../index')
const User = require('../lib/mongo').User

describe('signup', () => {
  describe('POST /signup', () => {
    let agent = request.agent(app)
    beforeEach(done => {
      //创建一个用户
      User.create({
        name: 'aaa',
        password: '123456',
        avatar: '',
        gender: 'x',
        bio: ''
      })
//      .exec()
      .then(() => {
        done()
      })
      .catch(done)
    })

    afterEach(done => {
      //清空user表
      User.remove({})
//        .exec()
        .then(() => {
          done()
        })
        .catch(done)
    })

    //命名错误的情况
    it('wrong name', function(done) {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field({ name: '' })
        .redirects()
        .end(function(err, res) {
          if (err) return done(err);
          assert(res.text.match(/名字限制在１－1０个字符/));
          done();
        });
    });

   it('Wrong gender', done => {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field({name: 'along', gender: 'd'})
        .redirects()
        .end((err, res) => {
          if(err) return done(err)
          assert(res.text.match(/性别只能是m,f或x/))
          done()
        })
    })

    //************************
    //用户名被占用情况
    it('duplicate name', function(done) {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field({ name: 'aaa', gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
        .redirects()
        .end(function(err, res) {
          if (err) return done(err);
          assert(res.text.match(/用户名已被占用/));
          done();
        });
    });
   //注册成功的情况
    it('success', function(done) {
      agent
        .post('/signup')
        .type('form')
        .attach('avatar', path.join(__dirname, 'avatar.png'))
        .field({ name: 'nswbmw', gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
        .redirects()
        .end(function(err, res) {
          if (err) return done(err);
          assert(res.text.match(/注册成功/));
          done();
        });
    }); 
  })
})


