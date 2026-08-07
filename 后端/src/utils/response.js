// 统一响应封装
function ok(ctx, data, message = 'ok') {
  ctx.body = { code: 0, data, message };
}

// 把以字符串存储的 JSON 字段解析为对象（解析失败则保留原值）
function parseJson(row, fields) {
  if (!row) return row;
  const r = { ...row };
  fields.forEach((f) => {
    if (r[f]) {
      try {
        r[f] = JSON.parse(r[f]);
      } catch (e) {
        /* 保留原字符串 */
      }
    }
  });
  return r;
}

module.exports = { ok, parseJson };
