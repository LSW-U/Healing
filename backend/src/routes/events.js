const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
const { ok, parseJson } = require('../utils/response');

const router = new Router();

// 活动列表（可按月份/状态筛选：?month=2026-09&status=ended）
router.get('/api/events', async (ctx) => {
  const { month, status } = ctx.query;
  const where = [];
  const params = [];
  if (month) { where.push("strftime('%Y-%m', start_time) = ?"); params.push(month); }
  if (status) { where.push('status = ?'); params.push(status); }
  let sql = 'SELECT * FROM events';
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY start_time';
  ok(ctx, db.prepare(sql).all(...params).map((r) => parseJson(r, ['suitable_tags'])));
});

// 活动详情
router.get('/api/events/:id', async (ctx) => {
  const e = db.prepare('SELECT * FROM events WHERE id = ?').get(ctx.params.id);
  if (!e) ctx.throw(404, '活动不存在');
  ok(ctx, parseJson(e, ['suitable_tags']));
});

// 活动报名 + 支付
// 开发模式：直接模拟支付成功（status=paid），便于联调。
// 生产环境：此处应调用「微信支付 V3 下单」拿到 prepay_id 返回前端，
//   前端 wx.requestPayment 调起支付，支付结果在 /api/pay/notify 回调里更新 signups.status。
//   详见《搭建步骤.md》"微信支付接入"一节。
router.post('/api/events/:id/signup', auth, async (ctx) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(ctx.params.id);
  if (!event) ctx.throw(404, '活动不存在');
  if (event.status !== 'open') ctx.throw(400, '活动已截止报名');
  if (event.remaining_slots <= 0) ctx.throw(400, '名额已满，潮将满');
  const { name, phone } = ctx.request.body || {};
  if (!name || !phone) ctx.throw(400, '请填写姓名和手机号');

  const amount = event.fee;
  const info = db
    .prepare(
      `INSERT INTO signups (user_id, event_id, name, phone, amount, status, wx_order_id, paid_at)
       VALUES (?,?,?,?,?,?,?,?)`
    )
    .run(
      ctx.state.user.uid,
      event.id,
      name,
      phone,
      amount,
      'paid',
      'MOCK_' + Date.now(),
      amount > 0 ? new Date().toISOString() : null
    );
  db.prepare('UPDATE events SET remaining_slots = remaining_slots - 1 WHERE id = ?').run(event.id);
  // 报名成功消息
  db.prepare("INSERT INTO messages (user_id, type, title, content) VALUES (?, 'signup', '报名成功', ?)")
    .run(ctx.state.user.uid, `你已成功报名「${event.title}」，记得来`);
  ok(ctx, { signupId: info.lastInsertRowid, status: 'paid', amount });
});

// 我的报名 / 订单
router.get('/api/signups', auth, async (ctx) => {
  const { status } = ctx.query;
  const where = ['s.user_id = ?'];
  const params = [ctx.state.user.uid];
  if (status) { where.push('s.status = ?'); params.push(status); }
  const rows = db
    .prepare(
      `SELECT s.*, e.title, e.start_time, e.location, e.status AS event_status
       FROM signups s JOIN events e ON s.event_id = e.id
       WHERE ${where.join(' AND ')} ORDER BY s.created_at DESC`
    )
    .all(...params);
  ok(ctx, rows);
});

// ---- 活动 CRUD（需登录） ----

router.post('/api/events', auth, async (ctx) => {
  const { title, start_time, end_time, location, total_slots, remaining_slots, fee, status, description } = ctx.request.body;
  if (!title) ctx.throw(400, '标题不能为空');
  const r = db.prepare(
    `INSERT INTO events (title, start_time, end_time, location, total_slots, remaining_slots, fee, status, description)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).run(title, start_time || null, end_time || null, location || '', total_slots || 0, remaining_slots !== undefined ? remaining_slots : (total_slots || 0), fee || 0, status || 'open', description || '');
  ok(ctx, db.prepare('SELECT * FROM events WHERE id = ?').get(r.lastInsertRowid));
});

router.put('/api/events/:id', auth, async (ctx) => {
  const e = db.prepare('SELECT * FROM events WHERE id = ?').get(ctx.params.id);
  if (!e) ctx.throw(404, '活动不存在');
  const b = ctx.request.body;
  const fields = ['title','start_time','end_time','location','total_slots','remaining_slots','fee','status','description'];
  const sets = fields.filter(f => b[f] !== undefined).map(f => `${f}=?`).join(',');
  const vals = fields.filter(f => b[f] !== undefined).map(f => b[f]);
  if (sets) db.prepare(`UPDATE events SET ${sets} WHERE id=?`).run(...vals, e.id);
  ok(ctx, db.prepare('SELECT * FROM events WHERE id = ?').get(e.id));
});

router.delete('/api/events/:id', auth, async (ctx) => {
  const e = db.prepare('SELECT * FROM events WHERE id = ?').get(ctx.params.id);
  if (!e) ctx.throw(404, '活动不存在');
  db.prepare('DELETE FROM events WHERE id = ?').run(e.id);
  ok(ctx, { deleted: true });
});

// 管理端全部报名列表
router.get('/api/signups/all', auth, async (ctx) => {
  ok(ctx, db.prepare('SELECT s.*, e.title AS event_title FROM signups s LEFT JOIN events e ON s.event_id = e.id ORDER BY s.created_at DESC').all());
});

module.exports = router;
