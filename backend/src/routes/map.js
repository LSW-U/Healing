const Router = require('koa-router');
const config = require('../config');
const { ok } = require('../utils/response');

const router = new Router();

// 腾讯地图 WebServiceAPI 代理（批3b-fix2）：
// admin 端弃用 JS SDK（GL 主脚本 onload 但 TMap.service 懒初始化，只调服务不建图 → service 永远 undefined），
// 改由服务端代理 WebServiceAPI。key 只存后端，不下发前端。
const WS_BASE = 'https://apis.map.qq.com/ws';
const FETCH_TIMEOUT = 5000;

// 代理公共逻辑：fetch 腾讯侧 → status!==0 归一为 code:1；网络异常/超时 → code:1 '地图服务不可用'
async function proxyWs(ctx, url) {
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), FETCH_TIMEOUT);
    let raw;
    try {
      raw = await fetch(url, { signal: ctl.signal });
    } finally {
      clearTimeout(timer);
    }
    const d = await raw.json();
    if (d && d.status === 0) return d;
    ctx.body = { code: 1, message: '地图服务：' + ((d && d.message) || ('status ' + (d && d.status))) };
    return null;
  } catch (e) {
    ctx.body = { code: 1, message: '地图服务不可用' };
    return null;
  }
}

// 地点关键词联想：GET /api/map/suggest?kw=xxx → {code:0,data:[{title,address,location:{lat,lng}}]}
router.get('/api/map/suggest', async (ctx) => {
  const kw = (ctx.query.kw || '').trim();
  if (!kw) return ok(ctx, []);
  if (!config.mapKey) { ctx.body = { code: 1, message: '地图服务：未配置 MAP_KEY' }; return; }
  const url = WS_BASE + '/place/v1/suggestion?keyword=' + encodeURIComponent(kw) + '&key=' + encodeURIComponent(config.mapKey);
  const d = await proxyWs(ctx, url);
  if (!d) return;
  const list = (d.data || []).map((x) => ({
    title: x.title || '',
    address: x.address || '',
    location: x.location ? { lat: x.location.lat, lng: x.location.lng } : null,
  }));
  ok(ctx, list);
});

// 地址反查坐标：GET /api/map/geocode?addr=xxx → {code:0,data:{lat,lng}}
router.get('/api/map/geocode', async (ctx) => {
  const addr = (ctx.query.addr || '').trim();
  if (!addr) { ctx.body = { code: 1, message: '地图服务：缺少 addr 参数' }; return; }
  if (!config.mapKey) { ctx.body = { code: 1, message: '地图服务：未配置 MAP_KEY' }; return; }
  const url = WS_BASE + '/geocoder/v1/?address=' + encodeURIComponent(addr) + '&key=' + encodeURIComponent(config.mapKey);
  const d = await proxyWs(ctx, url);
  if (!d) return;
  const loc = d.result && d.result.location;
  if (!loc) { ctx.body = { code: 1, message: '地图服务：未解析到坐标' }; return; }
  ok(ctx, { lat: loc.lat, lng: loc.lng });
});

// MAP_KEY 探测（保留）：admin 据此禁用「搜索地址」按钮并回退手输；未配置返回空串
router.get('/api/map-key', async (ctx) => {
  ok(ctx, { key: config.mapKey });
});

module.exports = router;
