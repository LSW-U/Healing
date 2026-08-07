const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
const { ok } = require('../utils/response');

const router = new Router({ prefix: '/api/checkins' });

// 重新计算连续打卡天数与潮位
function recomputeStreak(uid) {
  const rows = db
    .prepare('SELECT date FROM checkins WHERE user_id = ? GROUP BY date ORDER BY date DESC')
    .all(uid);
  const dates = rows.map((r) => r.date);
  if (dates.length === 0) return { streak: 0, tide: 0 };
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = Math.round((new Date(dates[i - 1]) - new Date(dates[i])) / 86400000);
    if (diff === 1) streak++;
    else break;
  }
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  // 最近一次打卡不是今天也不是昨天 → 连续中断，归零
  if (dates[0] !== today && dates[0] !== yesterday) streak = 0;
  return { streak, tide: Math.min(streak, 7) };
}

// 打卡（行为在「练习完成反馈页」触发）
router.post('/', auth, async (ctx) => {
  const { content_id, mood, note } = ctx.request.body || {};
  const today = new Date().toISOString().slice(0, 10);
  const existing = db.prepare('SELECT id FROM checkins WHERE user_id = ? AND date = ?').get(ctx.state.user.uid, today);
  if (existing) ctx.throw(400, '今天已经打卡啦，海还在');
  db.prepare('INSERT INTO checkins (user_id, content_id, mood, note, date) VALUES (?,?,?,?,?)')
    .run(ctx.state.user.uid, content_id || null, mood || null, note || null, today);
  const { streak, tide } = recomputeStreak(ctx.state.user.uid);
  db.prepare('UPDATE users SET checkin_streak = ?, tide_level = ? WHERE id = ?')
    .run(streak, tide, ctx.state.user.uid);
  // 累加练习时长
  if (content_id) {
    const c = db.prepare('SELECT duration FROM contents WHERE id = ?').get(content_id);
    if (c) db.prepare('UPDATE users SET total_practice_seconds = total_practice_seconds + ? WHERE id = ?')
      .run(c.duration || 0, ctx.state.user.uid);
  }
  ok(ctx, { streak, tide_level: tide });
});

// 我的打卡记录
router.get('/', auth, async (ctx) => {
  ok(ctx, db.prepare('SELECT * FROM checkins WHERE user_id = ? ORDER BY date DESC LIMIT 100').all(ctx.state.user.uid));
});

// 潮汐图数据（连续天数 + 潮位）
router.get('/tide', auth, async (ctx) => {
  const { streak, tide } = recomputeStreak(ctx.state.user.uid);
  ok(ctx, { streak, tide_level: tide });
});

module.exports = router;
