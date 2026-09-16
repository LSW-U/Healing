const config = require('../config');

// audio_url / 封面等媒体地址双口径（Q4）：
// - http(s):// 开头的外链直用
// - 否则视为本服务相对路径（/uploads/...），用 PUBLIC_BASE_URL 拼成完整 URL
// PUBLIC_BASE_URL 未配置时回退返回相对路径（小程序/同域部署下仍可访问）
function resolveMediaUrl(p) {
  if (!p) return p;
  if (/^https?:\/\//i.test(p)) return p;
  const base = config.publicBaseUrl;
  if (!base) return p;
  return base.replace(/\/+$/, '') + (p.startsWith('/') ? p : '/' + p);
}

module.exports = { resolveMediaUrl };
