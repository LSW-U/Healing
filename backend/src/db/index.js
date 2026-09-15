const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const config = require('../config');

// 确保数据库目录存在
const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 初始化表结构（幂等，可重复执行）
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// ---- 轻量迁移（启动自动执行，旧库零丢失）----
// users.role：旧库无 role 列时补上（01-D6）
const userCols = db.pragma('table_info(users)').map((c) => c.name);
if (!userCols.includes('role')) {
  db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
  console.log('[迁移] users 表已补充 role 列');
}
// solar_terms.description：旧库无该列时补上（管理后台节气面板编辑需要）
const solarCols = db.pragma('table_info(solar_terms)').map((c) => c.name);
if (!solarCols.includes('description')) {
  db.exec('ALTER TABLE solar_terms ADD COLUMN description TEXT');
  console.log('[迁移] solar_terms 表已补充 description 列');
}

module.exports = db;
