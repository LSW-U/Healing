const Router = require('koa-router');
const db = require('../db');
const auth = require('../middleware/auth');
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

router.post('/', auth, async (ctx) => {
  const { name, title, intro, bio, tags, services, is_contracted } = ctx.request.body;
  if (!name) ctx.throw(400, '姓名不能为空');
  const r = db.prepare(
    'INSERT INTO healers (name, title, intro, bio, tags, services, is_contracted) VALUES (?,?,?,?,?,?,?)'
  ).run(name, title || '', intro || '', bio || '', tags || '[]', services || '[]', is_contracted ? 1 : 0);
  ok(ctx, db.prepare('SELECT * FROM healers WHERE id = ?').get(r.lastInsertRowid));
});

router.put('/:id', auth, async (ctx) => {
  const h = db.prepare('SELECT * FROM healers WHERE id = ?').get(ctx.params.id);
  if (!h) ctx.throw(404, '疗愈师不存在');
  const b = ctx.request.body;
  db.prepare(
    `UPDATE healers SET name=?, title=?, intro=?, bio=?, tags=?, services=?, is_contracted=? WHERE id=?`
  ).run(
    b.name !== undefined ? b.name : h.name,
    b.title !== undefined ? b.title : h.title,
    b.intro !== undefined ? b.intro : h.intro,
    b.bio !== undefined ? b.bio : h.bio,
    b.tags !== undefined ? b.tags : h.tags,
    b.services !== undefined ? b.services : h.services,
    b.is_contracted !== undefined ? (b.is_contracted ? 1 : 0) : h.is_contracted,
    h.id
  );
  ok(ctx, db.prepare('SELECT * FROM healers WHERE id = ?').get(h.id));
});

router.delete('/:id', auth, async (ctx) => {
  const h = db.prepare('SELECT * FROM healers WHERE id = ?').get(ctx.params.id);
  if (!h) ctx.throw(404, '疗愈师不存在');
  db.prepare('DELETE FROM healers WHERE id = ?').run(h.id);
  ok(ctx, { deleted: true });
});

module.exports = router;
