const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
const { ok } = require('../utils/response');

const router = new Router({ prefix: '/api/reminders' });

// 提醒设置列表
router.get('/', auth, async (ctx) => {
  ok(ctx, db.prepare('SELECT * FROM reminders WHERE user_id = ?').all(ctx.state.user.uid));
});

// 保存某场景提醒（morning / noon / night），存在则更新
router.put('/', auth, async (ctx) => {
  const { scene, enabled, dnd_start, dnd_end } = ctx.request.body || {};
  if (!scene) ctx.throw(400, '缺少 scene');
  db.prepare(
    `INSERT INTO reminders (user_id, scene, enabled, dnd_start, dnd_end) VALUES (?,?,?,?,?)
     ON CONFLICT(user_id, scene) DO UPDATE SET enabled=excluded.enabled, dnd_start=excluded.dnd_start, dnd_end=excluded.dnd_end`
  ).run(ctx.state.user.uid, scene, enabled ? 1 : 0, dnd_start || null, dnd_end || null);
  ok(ctx, { saved: true });
});

module.exports = router;
