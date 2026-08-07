const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const config = require('./config');
const errorHandler = require('./middleware/error');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contentRoutes = require('./routes/content');
const healerRoutes = require('./routes/healers');
const eventRoutes = require('./routes/events');
const checkinRoutes = require('./routes/checkin');
const feelingRoutes = require('./routes/feelings');
const circleRoutes = require('./routes/circles');
const favoriteRoutes = require('./routes/favorites');
const messageRoutes = require('./routes/messages');
const reminderRoutes = require('./routes/reminders');
const crisisRoutes = require('./routes/crisis');
const miscRoutes = require('./routes/misc');

const app = new Koa();
app.use(errorHandler);
app.use(cors());      // 允许跨域：admin 页面 / 小程序均可访问
app.use(bodyParser());

const routers = [
  authRoutes, userRoutes, contentRoutes, healerRoutes, eventRoutes,
  checkinRoutes, feelingRoutes, circleRoutes, favoriteRoutes,
  messageRoutes, reminderRoutes, crisisRoutes, miscRoutes,
];
routers.forEach((r) => app.use(r.routes()).use(r.allowedMethods()));

app.listen(config.port, () => {
  console.log(`[共时海] 后端已启动: http://localhost:${config.port}`);
  if (config.devMode) {
    console.log('[开发模式] 未配置 WX_APPID，可使用任意 code 登录');
    console.log('          配置 .env 中的 WX_APPID / WX_SECRET 后即切换为真实微信登录');
  }
});
