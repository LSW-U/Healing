const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const { ok } = require('../utils/response');

const router = new Router({ prefix: '/api/quotes' });

// 每日一语列表（管理后台面板读，仅 admin；C 端走 /api/daily-greeting）
router.get('/', auth, requireAdmin, async (ctx) => {
  ok(ctx, db.prepare('SELECT * FROM quotes ORDER BY id DESC').all());
});

// ---- 写接口（仅 admin）----

router.post('/', auth, requireAdmin, async (ctx) => {
  const { text, source } = ctx.request.body || {};
  if (!text) ctx.throw(400, '内容不能为空');
  const r = db.prepare('INSERT INTO quotes (text, source) VALUES (?, ?)').run(text, source || '');
  ok(ctx, db.prepare('SELECT * FROM quotes WHERE id = ?').get(r.lastInsertRowid));
});

router.put('/:id', auth, requireAdmin, async (ctx) => {
  const q = db.prepare('SELECT * FROM quotes WHERE id = ?').get(ctx.params.id);
  if (!q) ctx.throw(404, '每日一语不存在');
  const b = ctx.request.body || {};
  db.prepare('UPDATE quotes SET text = ?, source = ? WHERE id = ?').run(
    b.text !== undefined ? b.text : q.text,
    b.source !== undefined ? b.source : q.source,
    q.id
  );
  ok(ctx, db.prepare('SELECT * FROM quotes WHERE id = ?').get(q.id));
});

router.delete('/:id', auth, requireAdmin, async (ctx) => {
  const q = db.prepare('SELECT * FROM quotes WHERE id = ?').get(ctx.params.id);
  if (!q) ctx.throw(404, '每日一语不存在');
  db.prepare('DELETE FROM quotes WHERE id = ?').run(q.id);
  ok(ctx, { deleted: true });
});

module.exports = router;
