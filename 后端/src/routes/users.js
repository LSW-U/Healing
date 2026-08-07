const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
const { ok } = require('../utils/response');

const router = new Router({ prefix: '/api/users' });

// 更新个人资料（昵称/头像/签名/手机）
router.put('/profile', auth, async (ctx) => {
  const { nickname, avatar, signature, phone } = ctx.request.body || {};
  const sets = [];
  const params = [];
  if (nickname !== undefined) { sets.push('nickname = ?'); params.push(nickname); }
  if (avatar !== undefined) { sets.push('avatar = ?'); params.push(avatar); }
  if (signature !== undefined) { sets.push('signature = ?'); params.push(signature); }
  if (phone !== undefined) { sets.push('phone = ?'); params.push(phone); }
  if (sets.length) {
    sets.push("updated_at = datetime('now')");
    params.push(ctx.state.user.uid);
    db.prepare('UPDATE users SET ' + sets.join(', ') + ' WHERE id = ?').run(...params);
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(ctx.state.user.uid);
  ok(ctx, user);
});

// 个人成长统计
router.get('/stats', auth, async (ctx) => {
  const uid = ctx.state.user.uid;
  const u = db
    .prepare('SELECT total_practice_seconds, checkin_streak, tide_level FROM users WHERE id = ?')
    .get(uid);
  const checkinDays = db
    .prepare('SELECT COUNT(DISTINCT date) c FROM checkins WHERE user_id = ?')
    .get(uid).c;
  const feelingCount = db.prepare('SELECT COUNT(*) c FROM feelings WHERE user_id = ?').get(uid).c;
  ok(ctx, { ...u, checkinDays, feelingCount });
});

// 导出个人全部数据（隐私合规——p25 导出我的数据）
router.get('/export-data', auth, async (ctx) => {
  const uid = ctx.state.user.uid;
  ok(ctx, {
    profile: db.prepare('SELECT * FROM users WHERE id = ?').get(uid),
    journals: db.prepare('SELECT * FROM journals WHERE user_id = ? ORDER BY date DESC').all(uid),
    feelings: db.prepare('SELECT * FROM feelings WHERE user_id = ? ORDER BY created_at DESC').all(uid),
    checkins: db.prepare('SELECT * FROM checkins WHERE user_id = ? ORDER BY date DESC').all(uid),
    signups: db.prepare('SELECT s.*, e.title, e.start_time, e.location FROM signups s JOIN events e ON s.event_id = e.id WHERE s.user_id = ?').all(uid),
    messages: db.prepare('SELECT * FROM messages WHERE user_id = ?').all(uid),
    favorites: db.prepare('SELECT * FROM favorites WHERE user_id = ?').all(uid),
  });
});

// 删除账户及所有关联数据（隐私合规——p25 删除我的数据）
router.delete('/account', auth, async (ctx) => {
  const uid = ctx.state.user.uid;
  const tables = ['feelings', 'journals', 'checkins', 'signups', 'favorites', 'messages', 'reminders',
                  'circle_posts', 'circle_reactions', 'circle_members'];
  db.transaction(() => {
    tables.forEach((t) => db.prepare(`DELETE FROM ${t} WHERE user_id = ?`).run(uid));
    // 清理用户创建的共修圈
    const circles = db.prepare('SELECT id FROM circles WHERE creator_id = ?').all(uid);
    circles.forEach((c) => {
      db.prepare('DELETE FROM circle_posts WHERE circle_id = ?').run(c.id);
      db.prepare('DELETE FROM circle_reactions WHERE post_id IN (SELECT id FROM circle_posts WHERE circle_id = ?)').run(c.id);
      db.prepare('DELETE FROM circle_members WHERE circle_id = ?').run(c.id);
      db.prepare('DELETE FROM circles WHERE id = ?').run(c.id);
    });
    db.prepare('DELETE FROM users WHERE id = ?').run(uid);
  })();
  ok(ctx, null, '账户已删除');
});

module.exports = router;
