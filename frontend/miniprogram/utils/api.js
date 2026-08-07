// 所有接口路径集中管理——已与后端实际路由对齐
const api = {
  // 认证（无 /api 前缀，根路由）
  login: '/login',
  me: '/me',

  // 内容（有 /api 前缀）
  contents: '/api/contents',
  recommendToday: '/api/contents/recommend/today',
  contentDetail: (id) => `/api/contents/${id}`,
  columns: '/api/columns',
  columnDetail: (id) => `/api/columns/${id}`,

  // 疗愈师
  healers: '/api/healers',
  healerDetail: (id) => `/api/healers/${id}`,

  // 活动 / 报名
  events: '/api/events',
  eventDetail: (id) => `/api/events/${id}`,
  signup: (id) => `/api/events/${id}/signup`,
  signups: '/api/signups',

  // 打卡 / 感受 / 日记
  checkins: '/api/checkins',
  checkinTide: '/api/checkins/tide',
  feelings: '/api/feelings',
  journals: '/api/journals',

  // 用户
  userStats: '/api/users/stats',
  userProfile: '/api/users/profile',
  userExport: '/api/users/export-data',   // 隐私：导出我的数据
  userDelete: '/api/users/account',       // 隐私：注销/删除账户

  // 共修圈
  circles: '/api/circles',
  circleDetail: (id) => `/api/circles/${id}`,
  circleJoin: (id) => `/api/circles/${id}/join`,
  circlePosts: (id) => `/api/circles/${id}/posts`,
  circleReact: (id) => `/api/circles/posts/${id}/react`,

  // 收藏 / 消息 / 提醒
  favorites: '/api/favorites',
  favoriteDelete: (id) => `/api/favorites/${id}`,
  messages: '/api/messages',
  messagesUnread: '/api/messages/unread-count',
  messageRead: (id) => `/api/messages/${id}/read`,
  reminders: '/api/reminders',
  reminderItem: (id) => `/api/reminders/${id}`,

  // 其他（misc 路由）
  crisis: '/api/crisis',
  dailyGreeting: '/api/daily-greeting',
  breathingPatterns: '/api/breathing-patterns',
  search: '/api/search'
}

module.exports = { api }
