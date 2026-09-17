const Router = require('koa-router');
const config = require('../config');
const { ok } = require('../utils/response');

const router = new Router();

// 腾讯地图 JS API key（公开：admin 页同会话一次探测用；仅返回 key 本身，不泄露其他配置）
// 未配置返回空串，admin 据此禁用「搜索地址」按钮并回退手输
router.get('/api/map-key', async (ctx) => {
  ok(ctx, { key: config.mapKey });
});

module.exports = router;
