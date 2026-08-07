// 统一错误处理：把抛出的错误转成 { code, message }
module.exports = async function errorHandler(ctx, next) {
  try {
    await next();
    // 若路由未设置 body，给个默认成功结构
    if (ctx.body === undefined && ctx.status === 404) {
      ctx.body = { code: 404, message: '接口不存在' };
    }
  } catch (err) {
    const status = err.status || 500;
    ctx.status = status;
    ctx.body = { code: status, message: err.message || '服务器错误' };
    if (status === 500) {
      console.error('[ERROR]', err);
    }
  }
};
