const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
const { ok } = require('../utils/response');

const router = new Router({ prefix: '/api/favorites' });

// 我的收藏（可按类型筛选：?target_type=content）
router.get('/', auth, async (ctx) => {
  const { target_type } = ctx.query;
  const uid = ctx.state.user.uid;
  if (target_type) {
    ok(ctx, db.prepare('SELECT * FROM favorites WHERE user_id = ? AND target_type = ? ORDER BY created_at DESC').all(uid, target_type));
  } else {
    ok(ctx, db.prepare('SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC').all(uid));
  }
});

// 添加收藏（content / healer / course）
router.post('/', auth, async (ctx) => {
  const { target_type, target_id, group_name = '' } = ctx.request.body || {};
  if (!target_type || !target_id) ctx.throw(400, '缺少参数');
  db.prepare('INSERT OR IGNORE INTO favorites (user_id, target_type, target_id, group_name) VALUES (?,?,?,?)')
    .run(ctx.state.user.uid, target_type, target_id, group_name);
  ok(ctx, { favorited: true });
});

// 取消收藏
router.delete('/:id', auth, async (ctx) => {
  db.prepare('DELETE FROM favorites WHERE id = ? AND user_id = ?').run(ctx.params.id, ctx.state.user.uid);
  ok(ctx, { removed: true });
});

module.exports = router;
