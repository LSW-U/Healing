// 高危词扫描（04-D3/D7）：关键词包含匹配，宁滥勿缺，不做语义判断
// 命中后：返回 crisis_resources（priority 升序）供响应内嵌，并写一条 type:'system' 站内信
const db = require('../db');

const SYSTEM_TITLE = '我们注意到你此刻可能很难';
const SYSTEM_CONTENT =
  '你刚刚写下的内容里，似乎有一些沉重的情绪。如果愿意，可以拨打心理援助热线和专业人士聊聊：' +
  '北京心理危机研究与干预中心 010-82951332、全国心理援助热线 12356、希望24热线 400-161-9995。' +
  '也可以在小程序任意页面点击「危机援助资源」查看完整热线。如处紧急情况，请立即拨打 120 或 110。';

// 返回命中的关键词数组（去重）
function scanText (text) {
  if (!text) return [];
  const words = db.prepare('SELECT word FROM crisis_keywords').all().map((r) => r.word);
  return words.filter((w) => w && String(text).includes(w));
}

// 命中后的统一动作：写站内信 + 取全量热线（供响应内嵌，避免前端二次请求）
function onHit (uid) {
  db.prepare("INSERT INTO messages (user_id, type, title, content) VALUES (?, 'system', ?, ?)")
    .run(uid, SYSTEM_TITLE, SYSTEM_CONTENT);
  return db.prepare('SELECT * FROM crisis_resources ORDER BY priority').all();
}

module.exports = { scanText, onHit };
