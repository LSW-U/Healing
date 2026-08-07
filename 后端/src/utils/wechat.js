const https = require('https');
const config = require('../config');

// 微信 code2session：用登录 code 换取 openid / unionid
// 文档：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html
function code2Session(code) {
  return new Promise((resolve, reject) => {
    // 开发模式（未配置 appid）：用 code 直接生成 openid，方便本地联调
    if (config.devMode) {
      return resolve({ openid: 'dev_' + code, unionid: null });
    }
    const url =
      `https://api.weixin.qq.com/sns/jscode2session?appid=${config.wx.appid}` +
      `&secret=${config.wx.secret}&js_code=${code}&grant_type=authorization_code`;
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

module.exports = { code2Session };
