const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const { ok, parseJson } = require('../utils/response');
const { resolveMediaUrl } = require('../utils/url');

// audio_url 双口径（Q4）：相对路径拼成完整 URL（PUBLIC_BASE_URL），外链直用；纯输出层拼接，不改存量字段语义
function withAudioUrl(row) {
  if (!row) return row;
  return { ...row, audio_url: resolveMediaUrl(row.audio_url) };
}

const router = new Router();

// ---- GET 查询 ----

// 内容列表（分类筛选）
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
    .map((r) => withAudioUrl(parseJson(r, ['scene_tags', 'form_tags', 'sections'])));
  ok(ctx, list);
});

// 内容详情（同时累加播放量）
router.get('/api/contents/:id', async (ctx) => {
  const c = db.prepare('SELECT * FROM contents WHERE id = ?').get(ctx.params.id);
  if (!c) ctx.throw(404, '内容不存在');
  db.prepare('UPDATE contents SET play_count = play_count + 1 WHERE id = ?').run(c.id);
  ok(ctx, withAudioUrl(parseJson(c, ['scene_tags', 'form_tags', 'sections'])));
});

// 今日共时推荐
router.get('/api/contents/recommend/today', async (ctx) => {
  const hour = new Date().getHours();
  let type = 'meditation';
  if (hour >= 11 && hour < 18) type = 'sound';
  else if (hour >= 18) type = 'sleep';
  const hero = db.prepare('SELECT * FROM contents ORDER BY play_count DESC LIMIT 1').get();
  const list = db.prepare('SELECT * FROM contents WHERE type = ? LIMIT 3').all(type);
  ok(ctx, {
    hero: hero ? withAudioUrl(parseJson(hero, ['scene_tags', 'form_tags'])) : null,
    list: list.map((r) => withAudioUrl(parseJson(r, ['scene_tags', 'form_tags']))),
  });
});

router.get('/api/columns', async (ctx) => {
  ok(ctx, db.prepare('SELECT * FROM columns ORDER BY sort').all());
});

router.get('/api/columns/:id', async (ctx) => {
  const col = db.prepare('SELECT * FROM columns WHERE id = ?').get(ctx.params.id);
  if (!col) ctx.throw(404, '专栏不存在');
  const items = db
    .prepare(`SELECT c.* FROM contents c JOIN column_contents cc ON c.id = cc.content_id WHERE cc.column_id = ? ORDER BY cc.sort`)
    .all(col.id).map((r) => withAudioUrl(parseJson(r, ['scene_tags', 'form_tags', 'sections'])));
  ok(ctx, { ...col, contents: items });
});

// ---- POST/PUT/DELETE（需登录） ----

// sections 宽松校验（Q5）：须为数组且每项含 start/label；空串视为清空；返回入库字符串或 undefined（不更新）
function encodeSections(v) {
  if (v === undefined || v === null) return undefined;
  if (v === '') return '[]';
  if (!Array.isArray(v)) throw new Error('sections 须为数组');
  for (const s of v) {
    if (!s || typeof s !== 'object' || s.start === undefined || s.label === undefined) {
      throw new Error('sections 每项须含 start 和 label 字段');
    }
  }
  return JSON.stringify(v);
}

// scene_tags / form_tags 宽松校验：非数组 → 400
function encodeTags(v) {
  if (v === undefined || v === null) return undefined;
  if (v === '') return '[]';
  if (!Array.isArray(v)) throw new Error('标签字段须为数组');
  return JSON.stringify(v);
}

router.post('/api/contents', auth, requireAdmin, async (ctx) => {
  const { title, subtitle, type, duration, audio_url, description, is_free, healer_id,
          cover, scene_tags, form_tags, sections } = ctx.request.body;
  if (!title) ctx.throw(400, '标题不能为空');
  let st, ft, sec;
  try {
    st = encodeTags(scene_tags);
    ft = encodeTags(form_tags);
    sec = encodeSections(sections);
  } catch (e) {
    ctx.throw(400, e.message);
  }
  const r = db.prepare(
    `INSERT INTO contents (title, subtitle, type, duration, audio_url, description, is_free, healer_id, cover, scene_tags, form_tags, sections)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(title, subtitle || '', type || 'meditation', duration || 0, audio_url || '', description || '', is_free ? 1 : 0, healer_id || null,
        cover || '', st || null, ft || null, sec || null);
  ok(ctx, withAudioUrl(parseJson(db.prepare('SELECT * FROM contents WHERE id = ?').get(r.lastInsertRowid), ['scene_tags', 'form_tags', 'sections'])));
});

router.put('/api/contents/:id', auth, requireAdmin, async (ctx) => {
  const c = db.prepare('SELECT * FROM contents WHERE id = ?').get(ctx.params.id);
  if (!c) ctx.throw(404, '内容不存在');
  const b = ctx.request.body;
  let st, ft, sec;
  try {
    st = encodeTags(b.scene_tags);
    ft = encodeTags(b.form_tags);
    sec = encodeSections(b.sections);
  } catch (e) {
    ctx.throw(400, e.message);
  }
  const fields = ['title','subtitle','type','duration','audio_url','description','healer_id','cover','is_free'];
  let sets = fields.filter(f => b[f] !== undefined).map(f => `${f}=?`).join(',');
  let vals = fields.filter(f => b[f] !== undefined).map(f => f === 'is_free' ? (b[f] ? 1 : 0) : b[f]);
  if (st !== undefined) { sets += (sets ? ',' : '') + 'scene_tags=?'; vals.push(st); }
  if (ft !== undefined) { sets += (sets ? ',' : '') + 'form_tags=?'; vals.push(ft); }
  if (sec !== undefined) { sets += (sets ? ',' : '') + 'sections=?'; vals.push(sec); }
  if (sets) db.prepare(`UPDATE contents SET ${sets} WHERE id=?`).run(...vals, c.id);
  ok(ctx, withAudioUrl(parseJson(db.prepare('SELECT * FROM contents WHERE id = ?').get(c.id), ['scene_tags', 'form_tags', 'sections'])));
});

router.delete('/api/contents/:id', auth, requireAdmin, async (ctx) => {
  const c = db.prepare('SELECT * FROM contents WHERE id = ?').get(ctx.params.id);
  if (!c) ctx.throw(404, '内容不存在');
  db.prepare('DELETE FROM contents WHERE id = ?').run(c.id);
  ok(ctx, { deleted: true });
});

module.exports = router;
