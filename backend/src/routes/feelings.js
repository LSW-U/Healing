const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
const { ok } = require('../utils/response');

const router = new Router();

// 感受记录（练习完成反馈页触发）
router.post('/api/feelings', auth, async (ctx) => {
  const { mood, text, voice_url, image_url, related_content_id, is_private = 1 } = ctx.request.body || {};
  const info = db
    .prepare(
      'INSERT INTO feelings (user_id, mood, text, voice_url, image_url, related_content_id, is_private) VALUES (?,?,?,?,?,?,?)'
    )
    .run(ctx.state.user.uid, mood || null, text || null, voice_url || null, image_url || null, related_content_id || null, is_private ? 1 : 0);
  ok(ctx, { feelingId: info.lastInsertRowid });
});

// 我的感受记录（时间线）
router.get('/api/feelings', auth, async (ctx) => {
  ok(ctx, db.prepare('SELECT * FROM feelings WHERE user_id = ? ORDER BY created_at DESC LIMIT 100').all(ctx.state.user.uid));
});

// 疗愈日记（二期核心功能，此处先提供基础读写）
// POST 同一天多次写入会更新已有记录，避免重复
router.post('/api/journals', auth, async (ctx) => {
  const { date, weather, mood, text, image_url } = ctx.request.body || {};
  const entryDate = date || new Date().toISOString().slice(0, 10);
  const uid = ctx.state.user.uid;
  const existing = db.prepare('SELECT id FROM journals WHERE user_id = ? AND date = ?').get(uid, entryDate);
  if (existing) {
    db.prepare('UPDATE journals SET weather=?, mood=?, text=?, image_url=? WHERE id=?')
      .run(weather || null, mood || null, text || null, image_url || null, existing.id);
    ok(ctx, { journalId: existing.id, updated: true });
  } else {
    const info = db
      .prepare('INSERT INTO journals (user_id, date, weather, mood, text, image_url) VALUES (?,?,?,?,?,?)')
      .run(uid, entryDate, weather || null, mood || null, text || null, image_url || null);
    ok(ctx, { journalId: info.lastInsertRowid });
  }
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

module.exports = router;
