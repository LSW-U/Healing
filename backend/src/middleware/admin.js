const jwt = require('../utils/jwt');

// 管理员鉴权：须在 auth 之后使用，校验 ctx.state.user.role（01-D3）
module.exports = async function requireAdmin(ctx, next) {
  if (!ctx.state.user || ctx.state.user.role !== 'admin') {
    ctx.throw(403, '无权限');
  }
  await next();
};
