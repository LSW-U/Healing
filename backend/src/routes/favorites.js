const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
const { ok } = require('../utils/response');

const router = new Router({ prefix: '/api/favorites' });

// type 中文映射（对齐收藏页 cats「内 容/疗 愈 师/课 程」去空格匹配）
const TYPE_LABEL = { content: '内容', healer: '疗愈师', course: '课程' };

// 按 target_type 拼 JOIN 输出 title/subtitle/type（JOIN 落空 title 为 NULL → 前端渲染「内容已下架」）
const JOIN_SQL = {
  content: `SELECT f.*, c.title AS title, COALESCE(c.subtitle, c.type) AS subtitle
            FROM favorites f LEFT JOIN contents c ON c.id = f.target_id
            WHERE f.user_id = ? AND f.target_type = 'content' ORDER BY f.created_at DESC`,
  healer: `SELECT f.*, h.name AS title, COALESCE(h.title, h.intro) AS subtitle
           FROM favorites f LEFT JOIN healers h ON h.id = f.target_id
           WHERE f.user_id = ? AND f.target_type = 'healer' ORDER BY f.created_at DESC`,
  course: null // courses 表未建（方案 10），course 分支空集容错
};

function joinRow(r) {
  if (r.target_type === 'course') return { ...r, type: TYPE_LABEL.course };
  const table = r.target_type === 'content' ? 'contents' : r.target_type === 'healer' ? 'healers' : null;
  if (!table) return r;
  const src = db.prepare(`SELECT title AS t, ${table === 'contents' ? "COALESCE(subtitle, type)" : "COALESCE(title, intro)"} AS s FROM ${table} WHERE id = ?`).get(r.target_id);
  return { ...r, title: src ? src.t : null, subtitle: src ? src.s : null, type: TYPE_LABEL[r.target_type] || r.target_type };
}

function listFavorites(uid, targetType) {
  if (targetType === 'course') return [];
  const sql = JOIN_SQL[targetType];
  if (!sql) return db.prepare('SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC').all(uid);
  return db.prepare(sql).all(uid).map((r) => ({ ...r, type: TYPE_LABEL[targetType] || targetType }));
}

// 我的收藏（可按类型筛选：?target_type=content；?target_type=&target_id= 齐时为存在性查询）
router.get('/', auth, async (ctx) => {
  const { target_type, target_id } = ctx.query;
  const uid = ctx.state.user.uid;
  if (target_type && target_id) {
    const row = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ?').get(uid, target_type, target_id);
    return ok(ctx, { favorited: !!row });
  }
  if (target_type) return ok(ctx, listFavorites(uid, target_type));
  // 无筛选：三类合并（course 空集），按创建时间倒序
  const merged = db.prepare('SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC').all(uid);
  ok(ctx, merged.map(joinRow));
});

// 添加收藏（content / healer / course）
router.post('/', auth, async (ctx) => {
  const { target_type, target_id, group_name = '' } = ctx.request.body || {};
  if (!target_type || !target_id) ctx.throw(400, '缺少参数');
  db.prepare('INSERT OR IGNORE INTO favorites (user_id, target_type, target_id, group_name) VALUES (?,?,?,?)')
    .run(ctx.state.user.uid, target_type, target_id, group_name);
  ok(ctx, { favorited: true });
});

// 取消收藏（支持 ?target_type=&target_id= 按 target 删；保留 DELETE /:id）
router.delete('/', auth, async (ctx) => {
  const { target_type, target_id } = ctx.query;
  if (!target_type || !target_id) ctx.throw(400, '缺少参数');
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ?')
    .run(ctx.state.user.uid, target_type, target_id);
  ok(ctx, { removed: true });
});

router.delete('/:id', auth, async (ctx) => {
  db.prepare('DELETE FROM favorites WHERE id = ? AND user_id = ?').run(ctx.params.id, ctx.state.user.uid);
  ok(ctx, { removed: true });
});

module.exports = router;
