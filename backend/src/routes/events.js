const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
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

router.post('/api/events', auth, requireAdmin, async (ctx) => {
  const { title, start_time, end_time, location, total_slots, remaining_slots, fee, status, description,
          cover, guide_text, latitude, longitude, refund_policy, suitable_tags, is_solar_term, solar_term } = ctx.request.body;
  if (!title) ctx.throw(400, '标题不能为空');
  let tags = null;
  if (suitable_tags !== undefined && suitable_tags !== '') {
    if (!Array.isArray(suitable_tags)) ctx.throw(400, 'suitable_tags 须为数组');
    tags = JSON.stringify(suitable_tags);
  }
  const r = db.prepare(
    `INSERT INTO events (title, start_time, end_time, location, total_slots, remaining_slots, fee, status, description,
                         cover, guide_text, latitude, longitude, refund_policy, suitable_tags, is_solar_term, solar_term)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(title, start_time || null, end_time || null, location || '', total_slots || 0, remaining_slots !== undefined ? remaining_slots : (total_slots || 0), fee || 0, status || 'open', description || '',
        cover || '', guide_text || '', latitude || null, longitude || null, refund_policy || '', tags, is_solar_term ? 1 : 0, solar_term || null);
  ok(ctx, parseJson(db.prepare('SELECT * FROM events WHERE id = ?').get(r.lastInsertRowid), ['suitable_tags']));
});

router.put('/api/events/:id', auth, requireAdmin, async (ctx) => {
  const e = db.prepare('SELECT * FROM events WHERE id = ?').get(ctx.params.id);
  if (!e) ctx.throw(404, '活动不存在');
  const b = ctx.request.body;
  const fields = ['title','start_time','end_time','location','total_slots','remaining_slots','fee','status','description',
                  'cover','guide_text','latitude','longitude','refund_policy','is_solar_term','solar_term'];
  let sets = fields.filter(f => b[f] !== undefined).map(f => `${f}=?`).join(',');
  let vals = fields.filter(f => b[f] !== undefined).map(f => f === 'is_solar_term' ? (b[f] ? 1 : 0) : b[f]);
  if (b.suitable_tags !== undefined) {
    if (!Array.isArray(b.suitable_tags)) ctx.throw(400, 'suitable_tags 须为数组');
    sets += (sets ? ',' : '') + 'suitable_tags=?';
    vals.push(JSON.stringify(b.suitable_tags));
  }
  if (sets) db.prepare(`UPDATE events SET ${sets} WHERE id=?`).run(...vals, e.id);
  ok(ctx, parseJson(db.prepare('SELECT * FROM events WHERE id = ?').get(e.id), ['suitable_tags']));
});

router.delete('/api/events/:id', auth, requireAdmin, async (ctx) => {
  const e = db.prepare('SELECT * FROM events WHERE id = ?').get(ctx.params.id);
  if (!e) ctx.throw(404, '活动不存在');
  db.prepare('DELETE FROM events WHERE id = ?').run(e.id);
  ok(ctx, { deleted: true });
});

// 删除报名（仅 admin）
router.delete('/api/signups/:id', auth, requireAdmin, async (ctx) => {
  const s = db.prepare('SELECT * FROM signups WHERE id = ?').get(ctx.params.id);
  if (!s) ctx.throw(404, '报名记录不存在');
  db.prepare('DELETE FROM signups WHERE id = ?').run(s.id);
  ok(ctx, { deleted: true });
});

// 更新报名状态（仅 admin；status ∈ pending/paid/refunded/cancelled）
router.put('/api/signups/:id/status', auth, requireAdmin, async (ctx) => {
  const s = db.prepare('SELECT * FROM signups WHERE id = ?').get(ctx.params.id);
  if (!s) ctx.throw(404, '报名记录不存在');
  const { status } = ctx.request.body || {};
  const valid = ['pending', 'paid', 'refunded', 'cancelled'];
  if (!valid.includes(status)) ctx.throw(400, '状态非法，须为 pending/paid/refunded/cancelled');
  db.prepare('UPDATE signups SET status = ? WHERE id = ?').run(status, s.id);
  ok(ctx, db.prepare('SELECT * FROM signups WHERE id = ?').get(s.id));
});

// 管理端全部报名列表（敏感读：仅 admin）
router.get('/api/signups/all', auth, requireAdmin, async (ctx) => {
  ok(ctx, db.prepare('SELECT s.*, e.title AS event_title FROM signups s LEFT JOIN events e ON s.event_id = e.id ORDER BY s.created_at DESC').all());
});

module.exports = router;
