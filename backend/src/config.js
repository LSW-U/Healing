require('dotenv').config();
const path = require('path');

const devMode = !process.env.WX_APPID;

// ---- JWT 密钥治理（01-D4）：devMode 仅警告，生产 fail-fast ----
const DEFAULT_JWT_SECRET = 'gongsihai-dev-secret-change-me';
const jwtSecret = process.env.JWT_SECRET || '';
if (!jwtSecret || jwtSecret === DEFAULT_JWT_SECRET) {
  const hint = '请用随机密钥替换，生成命令：node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"';
  if (devMode) {
    console.warn('[警告] JWT_SECRET 未配置或仍为默认值，仅限本地开发使用。' + hint);
  } else {
    throw new Error('[启动失败] 生产环境必须配置安全的 JWT_SECRET。' + hint);
  }
}

// ---- 管理后台账密（01-D8）：生产模式必须配置 ----
const adminUser = process.env.ADMIN_USER || '';
const adminPass = process.env.ADMIN_PASS || '';
if (!devMode && (!adminUser || !adminPass)) {
  throw new Error('[启动失败] 生产环境必须配置 ADMIN_USER / ADMIN_PASS 环境变量（管理后台登录凭据）');
}

module.exports = {
  port: Number(process.env.PORT) || 3300,
  jwtSecret: jwtSecret || DEFAULT_JWT_SECRET,
  jwtExpiresIn: '30d',
  // 未配置微信 appid 时进入开发模式：用模拟 code 即可登录，便于本地联调
  devMode,
  adminUser,
  adminPass,
  wx: {
    appid: process.env.WX_APPID || '',
    secret: process.env.WX_SECRET || '',
  },
  dbPath:
    process.env.DB_PATH ||
    path.join(__dirname, '..', 'data', 'gongsihai.db'),
};
