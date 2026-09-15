const jwt = require('jsonwebtoken');
const config = require('../config');

function sign(payload) {
  // payload 无 role 时补默认值，保证旧调用签出的 token 始终带角色（01-D9）
  return jwt.sign({ role: 'user', ...payload }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

function verify(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = { sign, verify };
