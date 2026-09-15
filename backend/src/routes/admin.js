const Router = require('koa-router');
const crypto = require('crypto');
const jwt = require('../utils/jwt');
const config = require('../config');
const { ok } = require('../utils/response');

const router = new Router({ prefix: '/api/admin' });

// 时序安全的恒等时间比对（长度不等直接 401）
function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// 管理后台登录：账密 或 devMode 下的 devCode 快捷入口（01-D8）
router.post('/login', async (ctx) => {
  const { username, password, devCode } = ctx.request.body || {};

  if (devCode !== undefined) {
    if (!config.devMode || devCode !== 'admin-dev') {
      ctx.throw(401, '用户名或密码错误');
    }
    const token = jwt.sign({ uid: 'admin', role: 'admin', openid: null });
    return ok(ctx, { token, user: { uid: 'admin', role: 'admin', openid: null } });
  }

  if (!username || !password) ctx.throw(400, '请输入用户名和密码');
  const userOk = safeEqual(username, config.adminUser);
  const passOk = safeEqual(password, config.adminPass);
  if (!userOk || !passOk) ctx.throw(401, '用户名或密码错误');

  const token = jwt.sign({ uid: 'admin', role: 'admin', openid: null });
  ok(ctx, { token, user: { uid: 'admin', role: 'admin', openid: null } });
});

module.exports = router;
