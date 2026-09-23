const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const { ok, parseJson } = require('../utils/response');

const router = new Router();

// 分类派生（05-D-A）：title 关键词映射，键值与 event-stream cats tab 文案对齐；未命中回落「活动」
const CATEGORY_RULES = [
  ['茶会', '节气茶会'],
  ['冥想', '月相共修/冥想'],
  ['共修', '月相共修/冥想'],
  ['颂钵', '颂钵沙龙'],
  ['音疗', '颂钵沙龙'],
  ['徒步', '正念徒步'],
  ['行走', '正念徒步'],
  ['绘画', '艺术疗愈'],
  ['艺术', '艺术疗愈'],
];
function deriveCategory(title) {
  for (const [key, cat] of CATEGORY_RULES) {
    if (title && title.includes(key)) return cat;
  }
  return '活动';
}

function eventTimeMs(value) {
  if (value === null || value === undefined || value === '') return null;
  const time = new Date(value);
  return Number.isNaN(time.getTime()) ? null : time.getTime();
}

// 活动状态懒推进：cancelled/ended 手动锁定，其余按当前时间自动流转。
function resolveEventStatus(row, now = new Date()) {
  if (!row) return 'open';
  if (row.status === 'cancelled' || row.status === 'ended') return row.status;
  const current = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const end = eventTimeMs(row.end_time);
  const start = eventTimeMs(row.start_time);
  if (end !== null && current >= end) return 'ended';
  if (start !== null && current >= start) return 'ongoing';
  return 'open';
}

function refreshEvent(row, now = new Date()) {
  const next = resolveEventStatus(row, now);
  if (next !== row.status) {
    db.prepare('UPDATE events SET status = ? WHERE id = ?').run(next, row.id);
    row.status = next;
  }
  return row;
}

// 活动列表（可按月份/状态筛选：?month=2026-09&status=ended）
router.get('/api/events', async (ctx) => {
  const { month, status } = ctx.query;
  const where = [];
  const params = [];
  if (month) { where.push("strftime('%Y-%m', start_time) = ?"); params.push(month); }
  let sql = 'SELECT * FROM events';
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY start_time';
  let rows = db.prepare(sql).all(...params);
  rows = rows.map((r) => refreshEvent(r));
  if (status) rows = rows.filter((r) => r.status === status);
  ok(ctx, rows.map((r) => ({ ...parseJson(r, ['suitable_tags']), category: deriveCategory(r.title) })));
});

// 活动详情
router.get('/api/events/:id', async (ctx) => {
  const e = refreshEvent(db.prepare('SELECT * FROM events WHERE id = ?').get(ctx.params.id));
  if (!e) ctx.throw(404, '活动不存在');
  ok(ctx, { ...parseJson(e, ['suitable_tags']), category: deriveCategory(e.title) });
});

// 活动报名 + 支付
// 开发模式：直接模拟支付成功（status=paid），便于联调。
// 生产环境：此处应调用「微信支付 V3 下单」拿到 prepay_id 返回前端，
//   前端 wx.requestPayment 调起支付，支付结果在 /api/pay/notify 回调里更新 signups.status。
//   详见《搭建步骤.md》"微信支付接入"一节。
router.post('/api/events/:id/signup', auth, async (ctx) => {
  const event = refreshEvent(db.prepare('SELECT * FROM events WHERE id = ?').get(ctx.params.id));
  if (!event) ctx.throw(404, '活动不存在');
  if (event.status !== 'open') ctx.throw(400, '活动已截止报名');
  // 一期不接微信支付：付费活动直接拦截（闸门，方案 14 二期放开）
  if (event.fee > 0) ctx.throw(400, '该活动不支持线上支付');
  const { name, phone } = ctx.request.body || {};
  if (!name || !phone) ctx.throw(400, '请填写姓名和手机号');

  const uid = ctx.state.user.uid;
  const amount = event.fee;
  const now = new Date().toISOString();
  const existing = db
    .prepare('SELECT * FROM signups WHERE user_id = ? AND event_id = ?')
    .get(uid, event.id);
  if (existing) {
    if (existing.status === 'paid') ctx.throw(400, '你已报名');
    // 复活边界（批3 G2）：满员事件取消后他人可占位，原用户复活会超卖 → 先查名额
    const slot = db
      .prepare('SELECT remaining_slots FROM events WHERE id = ?')
      .get(event.id);
    if (!slot || slot.remaining_slots <= 0) ctx.throw(400, '名额已满，潮将满');
    // cancelled → 事务内复活复用（id 不变），WHERE status='cancelled' 防并发双击
    const revive = db
      .prepare(
        `UPDATE signups SET status='paid', paid_at=?, wx_order_id=null, amount=?, name=?, phone=?
         WHERE id=? AND status='cancelled'`
      )
      .run(now, amount, name, phone, existing.id);
    if (revive.changes === 0) ctx.throw(400, '报名处理中，请勿重复提交');
    // 复活同样占一个名额：事务内原子条件扣减（与取消的 +1 对称，防并发超卖）
    let revived = false;
    const txn = db.transaction(() => {
      const dec = db
        .prepare('UPDATE events SET remaining_slots = remaining_slots - 1 WHERE id = ? AND remaining_slots > 0')
        .run(event.id);
      if (dec.changes === 0) ctx.throw(400, '名额已满，潮将满');
      revived = true;
    });
    txn();
    db.prepare("INSERT INTO messages (user_id, type, title, content) VALUES (?, 'signup', '报名成功', ?)")
      .run(uid, `你已成功报名「${event.title}」，记得来`);
    return ok(ctx, { signupId: existing.id, status: 'paid', amount });
  }

  // 事务内：原子条件扣减 → INSERT（防超卖）
  let signupId;
  const txn = db.transaction(() => {
    const dec = db
      .prepare('UPDATE events SET remaining_slots = remaining_slots - 1 WHERE id = ? AND remaining_slots > 0')
      .run(event.id);
    if (dec.changes === 0) {
      ctx.throw(400, '名额已满，潮将满');
    }
    const info = db
      .prepare(
        `INSERT INTO signups (user_id, event_id, name, phone, amount, status, wx_order_id, paid_at)
         VALUES (?,?,?,?,?,?,?,?)`
      )
      .run(uid, event.id, name, phone, amount, 'paid', null, amount > 0 ? now : null);
    signupId = info.lastInsertRowid;
  });
  txn();
  // 报名成功消息
  db.prepare("INSERT INTO messages (user_id, type, title, content) VALUES (?, 'signup', '报名成功', ?)")
    .run(uid, `你已成功报名「${event.title}」，记得来`);
  ok(ctx, { signupId, status: 'paid', amount });
});

// 取消报名（本人）：仅 paid 可取消，返还名额
router.post('/api/signups/:id/cancel', auth, async (ctx) => {
  const s = db.prepare('SELECT * FROM signups WHERE id = ?').get(ctx.params.id);
  if (!s || s.user_id !== ctx.state.user.uid) ctx.throw(404, '报名记录不存在');
  if (s.status !== 'paid') ctx.throw(400, '该报名无法取消');
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(s.event_id);
  if (!event) ctx.throw(404, '报名记录不存在');
  const start = eventTimeMs(event.start_time);
  if (start !== null && Date.now() >= start) ctx.throw(400, '活动已开始，无法取消');

  const txn = db.transaction(() => {
    const upd = db
      .prepare("UPDATE signups SET status='cancelled' WHERE id = ? AND status='paid'")
      .run(s.id);
    if (upd.changes === 0) ctx.throw(400, '该报名无法取消');
    db.prepare('UPDATE events SET remaining_slots = remaining_slots + 1 WHERE id = ? AND remaining_slots < total_slots')
      .run(event.id);
  });
  txn();
  ok(ctx, db.prepare('SELECT * FROM signups WHERE id = ?').get(s.id));
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
  // 状态白名单（批3b）：写入时校验，读取放行（老数据不拦截）
  const STATUSES = ['open', 'ongoing', 'ended', 'cancelled'];
  if (status !== undefined && !STATUSES.includes(status)) ctx.throw(400, '状态非法，须为 open/ongoing/ended/cancelled');
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
  // 状态白名单（批3b）：写入时校验，读取放行（老数据不拦截）
  const STATUSES = ['open', 'ongoing', 'ended', 'cancelled'];
  if (b.status !== undefined && !STATUSES.includes(b.status)) ctx.throw(400, '状态非法，须为 open/ongoing/ended/cancelled');
  const fields = ['title','start_time','end_time','location','total_slots','remaining_slots','fee','status','description',
                  'cover','guide_text','latitude','longitude','refund_policy','is_solar_term','solar_term'];
  let sets = fields.filter(f => b[f] !== undefined).map(f => `${f}=?`).join(',');
  let vals = fields.filter(f => b[f] !== undefined).map(f => f === 'is_solar_term' ? (b[f] ? 1 : 0) : b[f]);
  if (b.suitable_tags !== undefined) {
    // 空串视为清空，与 POST 口径一致（批 2 P3-1）
    if (b.suitable_tags === '') { sets += (sets ? ',' : '') + 'suitable_tags=?'; vals.push(null); }
    else {
      if (!Array.isArray(b.suitable_tags)) ctx.throw(400, 'suitable_tags 须为数组');
      sets += (sets ? ',' : '') + 'suitable_tags=?';
      vals.push(JSON.stringify(b.suitable_tags));
    }
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
module.exports.resolveEventStatus = resolveEventStatus;
