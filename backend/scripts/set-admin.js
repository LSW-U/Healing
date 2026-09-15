// 一次性脚本：把指定用户提权为 admin（01-D2）
// 用法：node scripts/set-admin.js <openid 或手机号或 uid>
// 幂等：已是 admin 时提示成功；找不到用户时报错退出。
const path = require('path');
const db = require('../src/db');

const key = process.argv[2];
if (!key) {
  console.error('用法: node scripts/set-admin.js <openid或手机号或uid>');
  process.exit(1);
}

let user = db.prepare('SELECT * FROM users WHERE openid = ?').get(key);
if (!user) user = db.prepare('SELECT * FROM users WHERE phone = ?').get(key);
if (!user) user = db.prepare('SELECT * FROM users WHERE id = ?').get(key);

if (!user) {
  console.error(`未找到用户：${key}（已尝试 openid / phone / id 三种匹配）`);
  process.exit(1);
}

if (user.role === 'admin') {
  console.log(`用户已是 admin，无需变更（幂等成功）：id=${user.id} openid=${user.openid}`);
  process.exit(0);
}

db.prepare("UPDATE users SET role = 'admin', updated_at = datetime('now') WHERE id = ?").run(user.id);
console.log(`已提权为 admin：id=${user.id} openid=${user.openid}`);
