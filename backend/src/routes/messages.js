const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
const { ok } = require('../utils/response');

const router = new Router({ prefix: '/api/messages' });

// 消息列表
router.get('/', auth, async (ctx) => {
  ok(ctx, db.prepare('SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC').all(ctx.state.user.uid));
});

// 未读消息数（用于 p06 badge、p10 入口红点）
router.get('/unread-count', auth, async (ctx) => {
  const c = db.prepare('SELECT COUNT(*) c FROM messages WHERE user_id = ? AND read = 0').get(ctx.state.user.uid).c;
  ok(ctx, { unread: c });
});

// 标记已读
router.put('/:id/read', auth, async (ctx) => {
  db.prepare('UPDATE messages SET read = 1 WHERE id = ? AND user_id = ?').run(ctx.params.id, ctx.state.user.uid);
  ok(ctx, { read: true });
});

module.exports = router;
