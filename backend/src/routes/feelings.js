const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
const { ok } = require('../utils/response');
const { scanText, onHit } = require('../utils/crisis-scan');

const router = new Router();

// 感受记录（练习完成反馈页触发）
router.post('/api/feelings', auth, async (ctx) => {
  const { mood, text, voice_url, image_url, related_content_id, is_private = 1 } = ctx.request.body || {};
  const info = db
    .prepare(
      'INSERT INTO feelings (user_id, mood, text, voice_url, image_url, related_content_id, is_private) VALUES (?,?,?,?,?,?,?)'
    )
    .run(ctx.state.user.uid, mood || null, text || null, voice_url || null, image_url || null, related_content_id || null, is_private ? 1 : 0);
  // 入库成功后高危词扫描（04-D7：告警不拦截）
  const res = { feelingId: info.lastInsertRowid };
  if (scanText(text).length) res.crisisAlert = true, res.crisis = onHit(ctx.state.user.uid);
  ok(ctx, res);
});

// 我的感受记录（时间线）
router.get('/api/feelings', auth, async (ctx) => {
  ok(ctx, db.prepare('SELECT * FROM feelings WHERE user_id = ? ORDER BY created_at DESC LIMIT 100').all(ctx.state.user.uid));
});

// 删除我的感受记录（仅本人）
router.delete('/api/feelings/:id', auth, async (ctx) => {
  const info = db.prepare('DELETE FROM feelings WHERE user_id = ? AND id = ?').run(ctx.state.user.uid, ctx.params.id);
  if (!info.changes) ctx.throw(404, '内容不存在');
  ok(ctx, { deleted: true });
});

// 疗愈日记（二期核心功能，此处先提供基础读写）
// POST 同一天多次写入会更新已有记录，避免重复
router.post('/api/journals', auth, async (ctx) => {
  const { date, weather, mood, text, image_url } = ctx.request.body || {};
  const entryDate = date || new Date().toISOString().slice(0, 10);
  const uid = ctx.state.user.uid;
  const existing = db.prepare('SELECT id FROM journals WHERE user_id = ? AND date = ?').get(uid, entryDate);
  const textToScan = text;
  let journalId;
  if (existing) {
    db.prepare('UPDATE journals SET weather=?, mood=?, text=?, image_url=? WHERE id=?')
      .run(weather || null, mood || null, text || null, image_url || null, existing.id);
    journalId = existing.id;
  } else {
    const info = db
      .prepare('INSERT INTO journals (user_id, date, weather, mood, text, image_url) VALUES (?,?,?,?,?,?)')
      .run(uid, entryDate, weather || null, mood || null, text || null, image_url || null);
    journalId = info.lastInsertRowid;
  }
  // 入库成功后高危词扫描（04-D7：告警不拦截）
  const res = { journalId };
  if (scanText(textToScan).length) res.crisisAlert = true, res.crisis = onHit(uid);
  ok(ctx, res);
});

// 疗愈日记列表（可按月份筛选：?month=2026-08，用于 p21 日历视图）
router.get('/api/journals', auth, async (ctx) => {
  const { month } = ctx.query;
  const uid = ctx.state.user.uid;
  if (month) {
    ok(ctx, db.prepare("SELECT * FROM journals WHERE user_id = ? AND strftime('%Y-%m', date) = ? ORDER BY date DESC")
      .all(uid, month));
  } else {
    ok(ctx, db.prepare('SELECT * FROM journals WHERE user_id = ? ORDER BY date DESC LIMIT 100').all(uid));
  }
});

// 删除我的日记（仅本人）
router.delete('/api/journals/:id', auth, async (ctx) => {
  const info = db.prepare('DELETE FROM journals WHERE user_id = ? AND id = ?').run(ctx.state.user.uid, ctx.params.id);
  if (!info.changes) ctx.throw(404, '内容不存在');
  ok(ctx, { deleted: true });
});

module.exports = router;
