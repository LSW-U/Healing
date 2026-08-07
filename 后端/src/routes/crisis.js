const Router = require('koa-router');
const db = require('../db');
const { ok } = require('../utils/response');

const router = new Router({ prefix: '/api/crisis' });

// 危机援助资源列表（一期必须接入：日记/感受高危词触发，或用户主动点"我需要帮助"）
router.get('/', async (ctx) => {
  ok(ctx, db.prepare('SELECT * FROM crisis_resources ORDER BY priority').all());
});

module.exports = router;
