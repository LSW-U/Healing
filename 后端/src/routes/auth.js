const Router = require('koa-router');
const db = require('../db');
const { code2Session } = require('../utils/wechat');
const jwt = require('../utils/jwt');
const auth = require('../middleware/auth');
const { ok } = require('../utils/response');

const router = new Router({ prefix: '/api/auth' });

// 微信登录：前端用 wx.login 拿 code 调此接口，换取 token
// 开发模式（未配 appid）：code 任意，如 "dev"
router.post('/login', async (ctx) => {
  const { code } = ctx.request.body || {};
  if (!code) ctx.throw(400, '缺少 code');
  const session = await code2Session(code);
  if (session.errcode) ctx.throw(400, '微信登录失败: ' + session.errmsg);
  const openid = session.openid;
  let user = db.prepare('SELECT * FROM users WHERE openid = ?').get(openid);
  if (!user) {
    const info = db
      .prepare('INSERT INTO users (openid, unionid) VALUES (?, ?)')
      .run(openid, session.unionid || null);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  }
  const token = jwt.sign({ uid: user.id, openid: user.openid });
  ok(ctx, { token, user });
});

// 获取当前用户信息（需登录）
router.get('/me', auth, async (ctx) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(ctx.state.user.uid);
  ok(ctx, user);
});

module.exports = router;
