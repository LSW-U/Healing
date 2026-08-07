const Router = require('koa-router');
const db = require('../db');
const { ok, parseJson } = require('../utils/response');

const router = new Router();

// 内容列表（分类筛选）
// 查询参数：type / scene / duration(short|mid|long) / sort(recommend|hot|new) / keyword / page / limit
router.get('/api/contents', async (ctx) => {
  const { type, scene, duration, sort = 'recommend', keyword, page = 1, limit = 20 } = ctx.query;
  const where = [];
  const params = [];
  if (type) { where.push('type = ?'); params.push(type); }
  if (scene) { where.push('scene_tags LIKE ?'); params.push('%' + scene + '%'); }
  if (duration === 'short') where.push('duration <= 300');
  else if (duration === 'mid') where.push('duration > 300 AND duration <= 900');
  else if (duration === 'long') where.push('duration > 900');
  if (keyword) { where.push('(title LIKE ? OR subtitle LIKE ?)'); params.push('%' + keyword + '%', '%' + keyword + '%'); }

  let order = 'ORDER BY id DESC';
  if (sort === 'hot') order = 'ORDER BY play_count DESC';
  else if (sort === 'new') order = 'ORDER BY id DESC';

  const sql =
    'SELECT * FROM contents' +
    (where.length ? ' WHERE ' + where.join(' AND ') : '') +
    ' ' + order + ' LIMIT ? OFFSET ?';
  const list = db
    .prepare(sql)
    .all(...params, Number(limit), (Number(page) - 1) * Number(limit))
    .map((r) => parseJson(r, ['scene_tags', 'form_tags', 'sections']));
  ok(ctx, list);
});

// 内容详情（同时累加播放量）
router.get('/api/contents/:id', async (ctx) => {
  const c = db.prepare('SELECT * FROM contents WHERE id = ?').get(ctx.params.id);
  if (!c) ctx.throw(404, '内容不存在');
  db.prepare('UPDATE contents SET play_count = play_count + 1 WHERE id = ?').run(c.id);
  ok(ctx, parseJson(c, ['scene_tags', 'form_tags', 'sections']));
});

// 今日共时推荐（规则版：按当前时段推荐类型）
router.get('/api/contents/recommend/today', async (ctx) => {
  const hour = new Date().getHours();
  let type = 'meditation';
  if (hour >= 11 && hour < 18) type = 'sound';
  else if (hour >= 18) type = 'sleep';
  const hero = db.prepare('SELECT * FROM contents ORDER BY play_count DESC LIMIT 1').get();
  const list = db.prepare('SELECT * FROM contents WHERE type = ? LIMIT 3').all(type);
  ok(ctx, {
    hero: hero ? parseJson(hero, ['scene_tags', 'form_tags']) : null,
    list: list.map((r) => parseJson(r, ['scene_tags', 'form_tags'])),
  });
});

// 主题专栏列表
router.get('/api/columns', async (ctx) => {
  ok(ctx, db.prepare('SELECT * FROM columns ORDER BY sort').all());
});

// 专栏详情（含内容列表）
router.get('/api/columns/:id', async (ctx) => {
  const col = db.prepare('SELECT * FROM columns WHERE id = ?').get(ctx.params.id);
  if (!col) ctx.throw(404, '专栏不存在');
  const items = db
    .prepare(
      `SELECT c.* FROM contents c
       JOIN column_contents cc ON c.id = cc.content_id
       WHERE cc.column_id = ? ORDER BY cc.sort`
    )
    .all(col.id)
    .map((r) => parseJson(r, ['scene_tags', 'form_tags', 'sections']));
  ok(ctx, { ...col, contents: items });
});

module.exports = router;
