const jwt = require('../utils/jwt');

// 鉴权中间件：校验 Authorization: Bearer <token>，把用户信息挂到 ctx.state.user
module.exports = async function auth(ctx, next) {
  const header = ctx.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    ctx.throw(401, '未登录');
  }
  try {
    const payload = jwt.verify(token);
    ctx.state.user = { uid: payload.uid, openid: payload.openid };
    await next();
  } catch (e) {
    ctx.throw(401, '登录已过期，请重新登录');
  }
};
