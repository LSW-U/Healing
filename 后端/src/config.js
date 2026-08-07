require('dotenv').config();
const path = require('path');

const devMode = !process.env.WX_APPID;

module.exports = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'gongsihai-dev-secret-change-me',
  jwtExpiresIn: '30d',
  // 未配置微信 appid 时进入开发模式：用模拟 code 即可登录，便于本地联调
  devMode,
  wx: {
    appid: process.env.WX_APPID || '',
    secret: process.env.WX_SECRET || '',
  },
  dbPath:
    process.env.DB_PATH ||
    path.join(__dirname, '..', 'data', 'gongsihai.db'),
};
