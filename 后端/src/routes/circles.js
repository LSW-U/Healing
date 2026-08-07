const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
const { ok } = require('../utils/response');

const router = new Router({ prefix: '/api/circles' });

// 共修圈列表
router.get('/', async (ctx) => {
  ok(ctx, db.prepare('SELECT * FROM circles WHERE status = \'active\' ORDER BY id DESC').all());
});

// 创建共修圈
router.post('/', auth, async (ctx) => {
  const { name, cycle_days = 21, theme } = ctx.request.body || {};
  if (!name) ctx.throw(400, '请填写圈子名称');
  const info = db
    .prepare('INSERT INTO circles (name, cycle_days, theme, creator_id, start_date, status) VALUES (?,?,?,?,?,?)')
    .run(name, cycle_days, theme || null, ctx.state.user.uid, new Date().toISOString().slice(0, 10), 'active');
  db.prepare('INSERT INTO circle_members (circle_id, user_id) VALUES (?,?)').run(info.lastInsertRowid, ctx.state.user.uid);
  ok(ctx, { circleId: info.lastInsertRowid });
});

// 圈子详情（含成员数 + 打卡流）
router.get('/:id', async (ctx) => {
  const c = db.prepare('SELECT * FROM circles WHERE id = ?').get(ctx.params.id);
  if (!c) ctx.throw(404, '圈子不存在');
  const memberCount = db.prepare('SELECT COUNT(*) c FROM circle_members WHERE circle_id = ?').get(c.id).c;
  const posts = db.prepare('SELECT * FROM circle_posts WHERE circle_id = ? ORDER BY created_at DESC LIMIT 50').all(c.id);
  ok(ctx, { ...c, memberCount, posts });
});

// 加入圈子
router.post('/:id/join', auth, async (ctx) => {
  db.prepare('INSERT OR IGNORE INTO circle_members (circle_id, user_id) VALUES (?,?)').run(ctx.params.id, ctx.state.user.uid);
  ok(ctx, { joined: true });
});

// 发打卡 / 感受（共修圈内只发这两类）
router.post('/:id/posts', auth, async (ctx) => {
  const { type = 'checkin', mood, text } = ctx.request.body || {};
  const info = db
    .prepare('INSERT INTO circle_posts (circle_id, user_id, type, mood, text) VALUES (?,?,?,?,?)')
    .run(ctx.params.id, ctx.state.user.uid, type, mood || null, text || null);
  ok(ctx, { postId: info.lastInsertRowid });
});

// 轻回应（也在 / 陪你）
router.post('/posts/:id/react', auth, async (ctx) => {
  const { type = '也在' } = ctx.request.body || {};
  db.prepare('INSERT OR IGNORE INTO circle_reactions (post_id, user_id, type) VALUES (?,?,?)').run(ctx.params.id, ctx.state.user.uid, type);
  ok(ctx, { reacted: true });
});

module.exports = router;
