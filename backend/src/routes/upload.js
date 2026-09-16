const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('@koa/multer');
const { MulterError } = require('multer'); // @koa/multer 不导出 MulterError，错误类取自 peer 依赖 multer
const Router = require('koa-router');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const config = require('../config');
const { ok } = require('../utils/response');
const { resolveMediaUrl } = require('../utils/url');

const router = new Router();

// 分类白名单：扩展名 + mimetype 双重校验
const AUDIO_EXT = ['.mp3', '.m4a', '.aac'];
const AUDIO_MIME = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/aacp'];
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp'];
const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const AUDIO_MAX = 50 * 1024 * 1024;
const IMAGE_MAX = 5 * 1024 * 1024;

function isAudio(file) {
  return AUDIO_EXT.includes(path.extname(file.originalname).toLowerCase()) && AUDIO_MIME.includes(file.mimetype);
}
function isImage(file) {
  return IMAGE_EXT.includes(path.extname(file.originalname).toLowerCase()) && IMAGE_MIME.includes(file.mimetype);
}

// 内存存储：便于计算 hash 文件名与按分类校验大小
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: AUDIO_MAX },
  fileFilter(req, file, cb) {
    if (isAudio(file) || isImage(file)) return cb(null, true);
    cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'file'));
  },
});

// multer 错误转统一契约 {code:1, message}
async function multerErrorMiddleware(ctx, next) {
  try {
    await next();
  } catch (err) {
    if (err instanceof MulterError) {
      ctx.status = 200;
      ctx.body = err.code === 'LIMIT_FILE_SIZE'
        ? { code: 1, message: '文件超过大小限制' }
        : { code: 1, message: '文件类型不允许' };
      return;
    }
    throw err;
  }
}

router.post('/api/admin/upload', multerErrorMiddleware, auth, requireAdmin, upload.single('file'), async (ctx) => {
  const file = ctx.file;
  if (!file) ctx.throw(400, '请选择要上传的文件');
  const audio = isAudio(file);
  const max = audio ? AUDIO_MAX : IMAGE_MAX;
  if (file.size > max) {
    ctx.body = { code: 1, message: '文件超过大小限制' };
    return;
  }

  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const ext = path.extname(file.originalname).toLowerCase();
  const hash = crypto.createHash('sha1').update(file.buffer).digest('hex');
  const dir = path.join(config.uploadDir, audio ? 'audio' : 'images', ym);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, hash + ext), file.buffer);

  ok(ctx, { url: resolveMediaUrl(`/uploads/${audio ? 'audio' : 'images'}/${ym}/${hash}${ext}`) });
});

module.exports = router;
