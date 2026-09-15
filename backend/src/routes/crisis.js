const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const { ok } = require('../utils/response');

const router = new Router({ prefix: '/api/crisis' });

// 危机援助资源列表（一期必须接入：日记/感受高危词触发，或用户主动点"我需要帮助"）
router.get('/', async (ctx) => {
  ok(ctx, db.prepare('SELECT * FROM crisis_resources ORDER BY priority').all());
});

// ---- 写接口（仅 admin，管理后台危机资源面板）----

router.post('/', auth, requireAdmin, async (ctx) => {
  const { name, phone, description, priority } = ctx.request.body || {};
  if (!name) ctx.throw(400, '名称不能为空');
  const r = db
    .prepare('INSERT INTO crisis_resources (name, phone, description, priority) VALUES (?,?,?,?)')
    .run(name, phone || '', description || '', priority || 0);
  ok(ctx, db.prepare('SELECT * FROM crisis_resources WHERE id = ?').get(r.lastInsertRowid));
});

router.put('/:id', auth, requireAdmin, async (ctx) => {
  const c = db.prepare('SELECT * FROM crisis_resources WHERE id = ?').get(ctx.params.id);
  if (!c) ctx.throw(404, '危机资源不存在');
  const b = ctx.request.body || {};
  db.prepare('UPDATE crisis_resources SET name = ?, phone = ?, description = ?, priority = ? WHERE id = ?').run(
    b.name !== undefined ? b.name : c.name,
    b.phone !== undefined ? b.phone : c.phone,
    b.description !== undefined ? b.description : c.description,
    b.priority !== undefined ? b.priority : c.priority,
    c.id
  );
  ok(ctx, db.prepare('SELECT * FROM crisis_resources WHERE id = ?').get(c.id));
});

router.delete('/:id', auth, requireAdmin, async (ctx) => {
  const c = db.prepare('SELECT * FROM crisis_resources WHERE id = ?').get(ctx.params.id);
  if (!c) ctx.throw(404, '危机资源不存在');
  db.prepare('DELETE FROM crisis_resources WHERE id = ?').run(c.id);
  ok(ctx, { deleted: true });
});

module.exports = router;
