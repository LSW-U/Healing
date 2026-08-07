const Router = require('koa-router');
const db = require('../db');
const { ok, parseJson } = require('../utils/response');

const router = new Router({ prefix: '/api/healers' });

// 疗愈师列表（可按流派 / 可预约形式筛选）
router.get('/', async (ctx) => {
  const { flow, form } = ctx.query;
  const where = [];
  const params = [];
  if (flow) { where.push('tags LIKE ?'); params.push('%' + flow + '%'); }
  if (form) { where.push('services LIKE ?'); params.push('%' + form + '%'); }
  const sql = 'SELECT * FROM healers' + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY sort';
  ok(ctx, db.prepare(sql).all(...params).map((r) => parseJson(r, ['tags', 'services'])));
});

// 疗愈师详情
router.get('/:id', async (ctx) => {
  const h = db.prepare('SELECT * FROM healers WHERE id = ?').get(ctx.params.id);
  if (!h) ctx.throw(404, '疗愈师不存在');
  ok(ctx, parseJson(h, ['tags', 'services']));
});

module.exports = router;
