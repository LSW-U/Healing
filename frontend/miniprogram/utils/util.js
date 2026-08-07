// 节气/月相/潮位/日期工具

// 2026 简化节气表（date 字段）
const SOLAR_TERMS_2026 = [
  { name:'小寒', date:'01-05' },{ name:'大寒', date:'01-20' },{ name:'立春', date:'02-04' },
  { name:'雨水', date:'02-18' },{ name:'惊蛰', date:'03-05' },{ name:'春分', date:'03-20' },
  { name:'清明', date:'04-05' },{ name:'谷雨', date:'04-20' },{ name:'立夏', date:'05-05' },
  { name:'小满', date:'05-21' },{ name:'芒种', date:'06-05' },{ name:'夏至', date:'06-21' },
  { name:'小暑', date:'07-07' },{ name:'大暑', date:'07-22' },{ name:'立秋', date:'08-07' },
  { name:'处暑', date:'08-23' },{ name:'白露', date:'09-07' },{ name:'秋分', date:'09-23' },
  { name:'寒露', date:'10-08' },{ name:'霜降', date:'10-23' },{ name:'立冬', date:'11-07' },
  { name:'小雪', date:'11-22' },{ name:'大雪', date:'12-07' },{ name:'冬至', date:'12-22' }
]

function getSolarTerm (dateObj) {
  const d = dateObj || new Date()
  const mmdd = String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  for (let i = SOLAR_TERMS_2026.length - 1; i >= 0; i--) {
    if (SOLAR_TERMS_2026[i].date <= mmdd) return SOLAR_TERMS_2026[i].name
  }
  return '冬至'
}

// 短时间问候词（带逗号，与「潮汐将至」配合三行展示）
function getGreetingTime () {
  const h = new Date().getHours()
  if (h < 8) return '早安，'
  if (h < 12) return '上午好，'
  if (h < 14) return '正午好，'
  if (h < 19) return '下午好，'
  return '晚安，'
}

function getGreetingByTime () {
  const h = new Date().getHours()
  if (h < 8) return '早安，潮汐将至，留 5 分钟给自己'
  if (h < 12) return '上午好，你正处在涨潮的方向'
  if (h < 14) return '正午，让一切都慢下来'
  if (h < 19) return '下午，海面微澜，呼吸刚好'
  return '晚安，让海浪替你守着长夜'
}

// 潮位格式化（0~7）
function formatTideLevel (level) {
  const tides = ['退潮', '微澜', '涨潮中', '半潮', '潮起', '满潮前夕', '满潮']
  return tides[level] || '静海'
}

// 简单月相（按日估算）
function getMoonPhase (dateObj) {
  const d = dateObj || new Date()
  const names = ['新月', '峨眉月', '上弦月', '盈凸月', '满月', '亏凸月', '下弦月', '残月']
  const day = d.getDate()
  return names[Math.floor((day % 29.5) / 29.5 * 8) % 8]
}

// 格式化时长（秒 → 分'秒"）
function formatDuration (seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}分${s}秒` : `${m}分钟`
}

// 格式化日期 (YYYY-MM-DD)
function formatDate (str) {
  if (!str) return ''
  return str.slice(0, 10)
}

module.exports = { getSolarTerm, getGreetingTime, getGreetingByTime, formatTideLevel, getMoonPhase, formatDuration, formatDate }
