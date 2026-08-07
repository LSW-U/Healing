-- ============================================================
-- 共时海小程序 · 数据库结构（SQLite）
-- 说明：所有 CREATE TABLE 均为 IF NOT EXISTS，可安全重复执行。
--       TEXT 类型的 JSON 字段（如 tags）以字符串存储，读取时在接口层 JSON.parse。
-- ============================================================

-- 用户
CREATE TABLE IF NOT EXISTS users (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  openid                TEXT UNIQUE,
  unionid               TEXT,
  nickname              TEXT,
  avatar                TEXT,
  signature             TEXT DEFAULT '',
  phone                 TEXT,
  total_practice_seconds INTEGER DEFAULT 0,  -- 累计练习秒数
  checkin_streak        INTEGER DEFAULT 0,   -- 连续打卡天数
  tide_level            INTEGER DEFAULT 0,   -- 潮汐图潮位（0~7）
  created_at            TEXT DEFAULT (datetime('now')),
  updated_at            TEXT DEFAULT (datetime('now'))
);

-- 内容 / 音频（冥想、声音、呼吸、助眠、音乐）
CREATE TABLE IF NOT EXISTS contents (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  subtitle    TEXT,
  cover       TEXT,
  healer_id   INTEGER,
  type        TEXT,                 -- meditation / breathing / sound / sleep / music
  duration    INTEGER DEFAULT 0,    -- 秒
  audio_url   TEXT,
  description TEXT,
  scene_tags  TEXT,                 -- JSON 数组：放松/助眠/专注/情绪调节/自我探索
  form_tags   TEXT,                 -- JSON 数组：冥想引导/呼吸练习/声音疗愈/音乐/自然声
  is_free     INTEGER DEFAULT 1,
  play_count  INTEGER DEFAULT 0,
  sections    TEXT,                 -- JSON 数组：分段（准备/引导/收束）
  created_at  TEXT DEFAULT (datetime('now'))
);

-- 主题专栏
CREATE TABLE IF NOT EXISTS columns (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  cover TEXT,
  intro TEXT,
  sort  INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS column_contents (
  column_id  INTEGER,
  content_id INTEGER,
  sort       INTEGER DEFAULT 0,
  PRIMARY KEY (column_id, content_id)
);

-- 疗愈师
CREATE TABLE IF NOT EXISTS healers (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  avatar       TEXT,
  title        TEXT,                -- 资质 / 流派
  intro        TEXT,                -- 一句话介绍
  bio          TEXT,                -- 详细受训背景
  tags         TEXT,                -- JSON 数组：颂钵/正念/表达性艺术...
  services     TEXT,                -- JSON 数组：1v1咨询/团体工作坊/音频课程
  is_contracted INTEGER DEFAULT 0,  -- 0 自有 1 签约
  sort         INTEGER DEFAULT 0
);

-- 线下活动
CREATE TABLE IF NOT EXISTS events (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT NOT NULL,
  cover          TEXT,
  guide_text     TEXT,
  start_time     TEXT,              -- ISO 时间
  end_time       TEXT,
  location       TEXT,
  latitude       REAL,
  longitude      REAL,
  total_slots    INTEGER DEFAULT 0,
  remaining_slots INTEGER DEFAULT 0,
  fee            INTEGER DEFAULT 0, -- 分（0 = 免费/公益）
  description    TEXT,
  suitable_tags  TEXT,              -- JSON 数组
  refund_policy  TEXT,
  is_solar_term  INTEGER DEFAULT 0, -- 是否节气活动
  solar_term     TEXT,              -- 关联节气名
  status         TEXT DEFAULT 'open', -- open / closed / ended
  created_at     TEXT DEFAULT (datetime('now'))
);

-- 报名 / 订单
CREATE TABLE IF NOT EXISTS signups (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER,
  event_id   INTEGER,
  name       TEXT,
  phone      TEXT,
  amount     INTEGER DEFAULT 0,     -- 分
  status     TEXT DEFAULT 'paid',   -- pending / paid / refunded / cancelled
  wx_order_id TEXT,
  paid_at    TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 潮汐打卡（打卡行为在「练习完成反馈页」触发）
CREATE TABLE IF NOT EXISTS checkins (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id   INTEGER,
  content_id INTEGER,
  mood      TEXT,
  note      TEXT,
  date      TEXT DEFAULT (date('now'))
);

-- 感受记录
CREATE TABLE IF NOT EXISTS feelings (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id          INTEGER,
  mood             TEXT,
  text             TEXT,
  voice_url        TEXT,
  image_url        TEXT,
  related_content_id INTEGER,
  is_private       INTEGER DEFAULT 1,
  created_at       TEXT DEFAULT (datetime('now'))
);

-- 疗愈日记
CREATE TABLE IF NOT EXISTS journals (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id   INTEGER,
  date      TEXT,
  weather   TEXT,
  mood      TEXT,
  text      TEXT,
  image_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 共修圈
CREATE TABLE IF NOT EXISTS circles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  cycle_days  INTEGER DEFAULT 21,   -- 21 / 49
  theme       TEXT,
  creator_id  INTEGER,
  start_date  TEXT,
  status      TEXT DEFAULT 'active',
  current_day INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS circle_members (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  circle_id INTEGER,
  user_id   INTEGER,
  joined_at TEXT DEFAULT (datetime('now')),
  UNIQUE (circle_id, user_id)
);
CREATE TABLE IF NOT EXISTS circle_posts (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  circle_id INTEGER,
  user_id   INTEGER,
  type      TEXT,                   -- checkin / feeling
  mood      TEXT,
  text      TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS circle_reactions (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id   INTEGER,
  user_id   INTEGER,
  type      TEXT,                   -- 也在 / 陪你
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (post_id, user_id, type)
);

-- 收藏
CREATE TABLE IF NOT EXISTS favorites (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER,
  target_type TEXT,                 -- content / healer / course
  target_id   INTEGER,
  group_name  TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  UNIQUE (user_id, target_type, target_id)
);

-- 消息中心
CREATE TABLE IF NOT EXISTS messages (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id   INTEGER,
  type      TEXT,                   -- subscribe / signup / circle / system
  title     TEXT,
  content   TEXT,
  read      INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 定时提醒设置
CREATE TABLE IF NOT EXISTS reminders (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id   INTEGER,
  scene     TEXT,                   -- morning / noon / night
  enabled   INTEGER DEFAULT 1,
  dnd_start TEXT,                   -- HH:MM 勿扰开始
  dnd_end   TEXT,                   -- HH:MM 勿扰结束
  UNIQUE (user_id, scene)
);

-- 危机援助资源（一期必须接入）
CREATE TABLE IF NOT EXISTS crisis_resources (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT,
  phone       TEXT,
  description TEXT,
  priority    INTEGER DEFAULT 0
);

-- 每日一语
CREATE TABLE IF NOT EXISTS quotes (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  text   TEXT NOT NULL,
  source TEXT
);

-- 呼吸法配置
CREATE TABLE IF NOT EXISTS breathing_patterns (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  inhale      INTEGER,              -- 吸气秒
  hold_in     INTEGER,              -- 屏息（吸后）秒
  exhale      INTEGER,              -- 呼气秒
  hold_out    INTEGER,              -- 屏息（呼后）秒
  cycles      INTEGER DEFAULT 0,    -- 0 = 不限
  description TEXT
);

-- 二十四节气（用于启动问候 / 活动日历标注）
CREATE TABLE IF NOT EXISTS solar_terms (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  date TEXT                       -- YYYY-MM-DD
);
