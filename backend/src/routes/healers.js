const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const { ok, parseJson } = require('../utils/response');

const router = new Router({ prefix: '/api/healers' });

router.get('/', async (ctx) => {
  const { flow, form } = ctx.query;
  const where = [];
  const params = [];
  if (flow) { where.push('tags LIKE ?'); params.push('%' + flow + '%'); }
  if (form) { where.push('services LIKE ?'); params.push('%' + form + '%'); }
  const sql = 'SELECT * FROM healers' + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY sort';
  ok(ctx, db.prepare(sql).all(...params).map((r) => parseJson(r, ['tags', 'services'])));
});

router.get('/:id', async (ctx) => {
  const h = db.prepare('SELECT * FROM healers WHERE id = ?').get(ctx.params.id);
  if (!h) ctx.throw(404, '疗愈师不存在');
  ok(ctx, parseJson(h, ['tags', 'services']));
});

router.post('/', auth, requireAdmin, async (ctx) => {
  const { name, title, intro, bio, tags, services, is_contracted, avatar } = ctx.request.body;
  if (!name) ctx.throw(400, '姓名不能为空');
  // 数组入库前序列化
  const encTags = (v) => (Array.isArray(v) ? JSON.stringify(v) : (v || '[]'));
  const r = db.prepare(
    'INSERT INTO healers (name, title, intro, bio, tags, services, is_contracted, avatar) VALUES (?,?,?,?,?,?,?,?)'
  ).run(name, title || '', intro || '', bio || '', encTags(tags), encTags(services), is_contracted ? 1 : 0, avatar || '');
  ok(ctx, db.prepare('SELECT * FROM healers WHERE id = ?').get(r.lastInsertRowid));
});

router.put('/:id', auth, requireAdmin, async (ctx) => {
  const h = db.prepare('SELECT * FROM healers WHERE id = ?').get(ctx.params.id);
  if (!h) ctx.throw(404, '疗愈师不存在');
  const b = ctx.request.body;
  // tags/services 数组入库前序列化（宽松口径：非数组原样传给 SQLite 报错）
  const encTags = (v) => (v !== undefined && Array.isArray(v) ? JSON.stringify(v) : v);
  db.prepare(
    `UPDATE healers SET name=?, title=?, intro=?, bio=?, tags=?, services=?, is_contracted=?, avatar=? WHERE id=?`
  ).run(
    b.name !== undefined ? b.name : h.name,
    b.title !== undefined ? b.title : h.title,
    b.intro !== undefined ? b.intro : h.intro,
    b.bio !== undefined ? b.bio : h.bio,
    encTags(b.tags) !== undefined ? encTags(b.tags) : h.tags,
    encTags(b.services) !== undefined ? encTags(b.services) : h.services,
    b.is_contracted !== undefined ? (b.is_contracted ? 1 : 0) : h.is_contracted,
    b.avatar !== undefined ? b.avatar : h.avatar,
    h.id
  );
  ok(ctx, db.prepare('SELECT * FROM healers WHERE id = ?').get(h.id));
});

router.delete('/:id', auth, requireAdmin, async (ctx) => {
  const h = db.prepare('SELECT * FROM healers WHERE id = ?').get(ctx.params.id);
  if (!h) ctx.throw(404, '疗愈师不存在');
  db.prepare('DELETE FROM healers WHERE id = ?').run(h.id);
  ok(ctx, { deleted: true });
});

module.exports = router;
