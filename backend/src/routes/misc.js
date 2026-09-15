const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const { ok } = require('../utils/response');

const router = new Router();

// 呼吸法配置列表
router.get('/api/breathing-patterns', async (ctx) => {
  ok(ctx, db.prepare('SELECT * FROM breathing_patterns').all());
});

// 更新呼吸法配置（仅 admin，管理后台呼吸配置面板）
router.put('/api/breathing-patterns/:id', auth, requireAdmin, async (ctx) => {
  const p = db.prepare('SELECT * FROM breathing_patterns WHERE id = ?').get(ctx.params.id);
  if (!p) ctx.throw(404, '呼吸法不存在');
  const b = ctx.request.body || {};
  db.prepare(
    'UPDATE breathing_patterns SET name = ?, inhale = ?, hold_in = ?, exhale = ?, hold_out = ?, cycles = ?, description = ? WHERE id = ?'
  ).run(
    b.name !== undefined ? b.name : p.name,
    b.inhale !== undefined ? b.inhale : p.inhale,
    b.hold_in !== undefined ? b.hold_in : p.hold_in,
    b.exhale !== undefined ? b.exhale : p.exhale,
    b.hold_out !== undefined ? b.hold_out : p.hold_out,
    b.cycles !== undefined ? b.cycles : p.cycles,
    b.description !== undefined ? b.description : p.description,
    p.id
  );
  ok(ctx, db.prepare('SELECT * FROM breathing_patterns WHERE id = ?').get(p.id));
});

// 启动问候：节气 + 每日一语
router.get('/api/daily-greeting', async (ctx) => {
  const today = new Date().toISOString().slice(0, 10);
  const term = db.prepare('SELECT name FROM solar_terms WHERE date = ?').get(today);
  const total = db.prepare('SELECT COUNT(*) c FROM quotes').get().c;
  const idx = Math.floor(Date.now() / 86400000) % Math.max(total, 1);
  const quote = db.prepare('SELECT * FROM quotes LIMIT 1 OFFSET ?').get(idx) || {};
  ok(ctx, {
    date: today,
    solarTerm: term ? term.name : null,
    quote: quote.text || '',
    source: quote.source || '',
  });
});

// 搜索：内容 / 疗愈师 / 专栏 分组返回
router.get('/api/search', async (ctx) => {
  const { q } = ctx.query;
  if (!q) return ok(ctx, { contents: [], healers: [], columns: [] });
  const contents = db.prepare('SELECT id,title,cover,type FROM contents WHERE title LIKE ? LIMIT 10').all('%' + q + '%');
  const healers = db.prepare('SELECT id,name,avatar,title FROM healers WHERE name LIKE ? OR title LIKE ? LIMIT 10').all('%' + q + '%', '%' + q + '%');
  const columns = db.prepare('SELECT id,title,cover FROM columns WHERE title LIKE ? LIMIT 10').all('%' + q + '%');
  ok(ctx, { contents, healers, columns });
});

module.exports = router;
