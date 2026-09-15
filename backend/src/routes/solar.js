const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const { ok } = require('../utils/response');

const router = new Router({ prefix: '/api/solar' });

// 节气列表（管理后台节气面板读，仅 admin；C 端走 /api/daily-greeting）
router.get('/', auth, requireAdmin, async (ctx) => {
  ok(ctx, db.prepare('SELECT * FROM solar_terms ORDER BY date').all());
});

// 更新节气（仅 admin，按 id 更新）
router.put('/:id', auth, requireAdmin, async (ctx) => {
  const s = db.prepare('SELECT * FROM solar_terms WHERE id = ?').get(ctx.params.id);
  if (!s) ctx.throw(404, '节气不存在');
  const b = ctx.request.body || {};
  db.prepare('UPDATE solar_terms SET name = ?, date = ?, description = ? WHERE id = ?').run(
    b.name !== undefined ? b.name : s.name,
    b.date !== undefined ? b.date : s.date,
    b.description !== undefined ? b.description : s.description,
    s.id
  );
  ok(ctx, db.prepare('SELECT * FROM solar_terms WHERE id = ?').get(s.id));
});

// 新增节气（仅 admin）
router.post('/', auth, requireAdmin, async (ctx) => {
  const { name, date, description } = ctx.request.body || {};
  if (!name) ctx.throw(400, '节气名称不能为空');
  const r = db.prepare('INSERT INTO solar_terms (name, date, description) VALUES (?,?,?)').run(
    name, date || null, description || ''
  );
  ok(ctx, db.prepare('SELECT * FROM solar_terms WHERE id = ?').get(r.lastInsertRowid));
});

// 删除节气（仅 admin）
router.delete('/:id', auth, requireAdmin, async (ctx) => {
  const s = db.prepare('SELECT * FROM solar_terms WHERE id = ?').get(ctx.params.id);
  if (!s) ctx.throw(404, '节气不存在');
  db.prepare('DELETE FROM solar_terms WHERE id = ?').run(s.id);
  ok(ctx, { deleted: true });
});

module.exports = router;
