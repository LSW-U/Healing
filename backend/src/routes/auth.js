const Router = require('koa-router');
const db = require('../db');
const { code2Session } = require('../utils/wechat');
const jwt = require('../utils/jwt');
const config = require('../config');
const auth = require('../middleware/auth');
const { ok } = require('../utils/response');

const router = new Router();

// 微信登录：前端用 wx.login 拿 code 调此接口，换取 token
// 开发模式（未配 appid）：code 任意，如 "dev"
// 开发模式专属：code 以 'admin-' 开头（如 "admin-dev"）→ 伪 admin 账号，供后台联调（01-D9）
router.post('/login', async (ctx) => {
  const { code } = ctx.request.body || {};
  if (!code) ctx.throw(400, '缺少 code');

  let openid, unionid = null, role = 'user';
  if (config.devMode && code.startsWith('admin-')) {
    // admin- 前缀在 code2Session 之前拦截，落库保证 uid 稳定
    openid = code;
    role = 'admin';
  } else {
    const session = await code2Session(code);
    if (session.errcode) ctx.throw(400, '微信登录失败: ' + session.errmsg);
    openid = session.openid;
    unionid = session.unionid || null;
  }

  let user = db.prepare('SELECT * FROM users WHERE openid = ?').get(openid);
  if (!user) {
    const info = db
      .prepare('INSERT INTO users (openid, unionid, role) VALUES (?, ?, ?)')
      .run(openid, unionid, role);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  }
  const token = jwt.sign({ uid: user.id, openid: user.openid, role: user.role || role });
  ok(ctx, { token, user });
});

// 获取当前用户信息（需登录）
router.get('/me', auth, async (ctx) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(ctx.state.user.uid);
  ok(ctx, user);
});

module.exports = router;
