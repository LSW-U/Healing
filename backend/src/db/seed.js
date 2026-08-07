// 初始化数据库 + 写入种子数据
// 运行：node src/db/seed.js   （npm run seed）
// 幂等：每张表只在为空时写入，可反复执行。
const db = require('./index');

const count = (table) => db.prepare(`SELECT COUNT(*) c FROM ${table}`).get().c;

const seed = db.transaction(() => {
  // ---------------- 危机援助资源（一期必须） ----------------
  if (count('crisis_resources') === 0) {
    const insert = db.prepare(
      'INSERT INTO crisis_resources (name, phone, description, priority) VALUES (?,?,?,?)'
    );
    insert.run('北京心理危机研究与干预中心', '010-82951332', '24 小时心理危机干预热线', 1);
    insert.run('全国心理援助热线', '12356', '全国统一心理援助热线（按地区转接）', 2);
    insert.run('希望24热线', '400-161-9995', '生命教育与危机干预热线', 3);
    console.log('· 已写入危机援助资源');
  }

  // ---------------- 呼吸法配置 ----------------
  if (count('breathing_patterns') === 0) {
    const insert = db.prepare(
      'INSERT INTO breathing_patterns (name, inhale, hold_in, exhale, hold_out, cycles, description) VALUES (?,?,?,?,?,?,?)'
    );
    insert.run('4-7-8 助眠呼吸', 4, 7, 8, 0, 4, '吸气4秒、屏息7秒、呼气8秒，帮助入睡');
    insert.run('盒式呼吸 4-4-4-4', 4, 4, 4, 4, 4, '四方等边呼吸，稳定情绪、提升专注');
    insert.run('共振呼吸 6-6', 6, 0, 6, 0, 0, '吸气6秒、呼气6秒，接近心率共振频率，舒缓放松');
    insert.run('自定义节律', 4, 0, 4, 0, 0, '可自定义吸气/屏息/呼气/屏息时长');
    console.log('· 已写入呼吸法配置');
  }

  // ---------------- 每日一语 ----------------
  if (count('quotes') === 0) {
    const insert = db.prepare('INSERT INTO quotes (text, source) VALUES (?,?)');
    const quotes = [
      ['海有自己的节奏，你也是。', '共时海'],
      ['潮起潮落，皆是 ocean 的呼吸。', '共时海'],
      ['允许自己像水一样，柔软地流过今天。', '共时海'],
      ['此刻，你只需要好好呼吸。', '共时海'],
      ['万物皆有裂痕，那是光照进来的地方。', '莱昂纳德·科恩'],
      ['你不必追赶浪潮，海一直在等你。', '共时海'],
      ['慢一点，也没关系。', '共时海'],
      ['把心放回身体里，听听它在说什么。', '共时海'],
      ['一呼一吸之间，世界会安静下来。', '共时海'],
      ['你值得被温柔以待，尤其是被自己。', '共时海'],
    ];
    quotes.forEach((q) => insert.run(q[0], q[1]));
    console.log('· 已写入每日一语');
  }

  // ---------------- 二十四节气（2026） ----------------
  if (count('solar_terms') === 0) {
    const insert = db.prepare('INSERT INTO solar_terms (name, date) VALUES (?,?)');
    const terms = [
      ['小寒', '2026-01-05'], ['大寒', '2026-01-20'], ['立春', '2026-02-04'],
      ['雨水', '2026-02-18'], ['惊蛰', '2026-03-05'], ['春分', '2026-03-20'],
      ['清明', '2026-04-05'], ['谷雨', '2026-04-20'], ['立夏', '2026-05-05'],
      ['小满', '2026-05-21'], ['芒种', '2026-06-05'], ['夏至', '2026-06-21'],
      ['小暑', '2026-07-07'], ['大暑', '2026-07-22'], ['立秋', '2026-08-07'],
      ['处暑', '2026-08-23'], ['白露', '2026-09-07'], ['秋分', '2026-09-23'],
      ['寒露', '2026-10-08'], ['霜降', '2026-10-23'], ['立冬', '2026-11-07'],
      ['小雪', '2026-11-22'], ['大雪', '2026-12-07'], ['冬至', '2026-12-22'],
    ];
    terms.forEach((t) => insert.run(t[0], t[1]));
    console.log('· 已写入二十四节气（2026）');
  }

  // ---------------- 疗愈师（占位，请用 pptx 真实资料替换） ----------------
  if (count('healers') === 0) {
    const insert = db.prepare(
      'INSERT INTO healers (name, avatar, title, intro, bio, tags, services, is_contracted, sort) VALUES (?,?,?,?,?,?,?,?,?)'
    );
    const healers = [
      ['林一沐', '', '艺术疗愈师 · 表达性艺术治疗', '用画笔与色彩，陪你安放情绪', '受训于表达性艺术治疗体系，专注曼陀罗绘画与房树人（HTP）取向。', JSON.stringify(['艺术疗愈', '表达性艺术', '曼陀罗']), JSON.stringify(['1v1咨询', '团体工作坊', '音频课程']), 0, 1],
      ['苏砚', '', '正念冥想引导师', '在呼吸之间，回到此刻', '多年正念冥想带教经验，擅长将东方禅意融入引导语。', JSON.stringify(['正念', '冥想', '禅修']), JSON.stringify(['团体工作坊', '音频课程']), 0, 2],
      ['陈知微', '', '颂钵音疗师 · 阿育吠陀', '让声音带你沉入深海', '将颂钵、水晶钵与阿育吠陀行走按摩结合，营造沉浸式声音疗愈。', JSON.stringify(['声音疗愈', '颂钵', '阿育吠陀']), JSON.stringify(['1v1咨询', '团体工作坊']), 1, 3],
      ['周临川', '', '哲学话疗师', '在思辨里，照见自己', '主持哲学思辨工作坊，以苏格拉底式对话陪伴自我探索。', JSON.stringify(['哲学话疗', '自我探索']), JSON.stringify(['团体工作坊']), 1, 4],
    ];
    healers.forEach((h) => insert.run(...h));
    console.log('· 已写入疗愈师（占位数据，待替换为真实资料）');
  }

  // ---------------- 内容 / 音频（占位，音频地址待替换为真实 URL） ----------------
  if (count('contents') === 0) {
    const insert = db.prepare(
      'INSERT INTO contents (title, subtitle, cover, healer_id, type, duration, audio_url, description, scene_tags, form_tags, is_free, sections) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
    );
    const contents = [
      ['冥想初级 · 呼吸锚定', '给第一次冥想的人', '', 2, 'meditation', 600, '/audio/冥想初级新手包/01-呼吸锚定.mp3', '从觉察呼吸开始，把散乱的念头轻轻放下。', JSON.stringify(['放松', '自我探索']), JSON.stringify(['冥想引导']), 1, JSON.stringify([{ name: '准备', t: 0 }, { name: '引导', t: 60 }, { name: '收束', t: 540 }])],
      ['晨间唤醒冥想', '用 10 分钟开启一天', '', 2, 'meditation', 600, '/audio/冥想初级新手包/02-晨间唤醒.mp3', '温和的晨间引导，让身体慢慢苏醒。', JSON.stringify(['专注', '放松']), JSON.stringify(['冥想引导']), 1, null],
      ['颂钵深度放松', '让声音带走紧绷', '', 3, 'sound', 1200, '/audio/冥想礼包及音频/颂钵深度放松.mp3', '颂钵与泛音交织，适合睡前或深度放松。', JSON.stringify(['助眠', '放松']), JSON.stringify(['声音疗愈', '自然声']), 1, null],
      ['雨声白噪音', '雨夜里的安心', '', 3, 'sound', 1800, '/audio/冥想礼包及音频/雨声白噪音.mp3', '自然雨声，陪你专注或入眠。', JSON.stringify(['助眠', '专注']), JSON.stringify(['自然声']), 1, null],
      ['4-7-8 助眠引导', '睡不着时的温柔陪伴', '', 2, 'sleep', 480, '/audio/冥想礼包及音频/478助眠引导.mp3', '跟着引导做 4-7-8 呼吸，慢慢沉入睡眠。', JSON.stringify(['助眠']), JSON.stringify(['冥想引导']), 1, null],
      ['七日疗愈 · Day1 回到身体', '一周的温柔练习', '', 1, 'meditation', 900, '/audio/为期一周的疗愈实践方案/Day1.mp3', '系列疗愈实践第一天：与身体重新连接。', JSON.stringify(['自我探索', '放松']), JSON.stringify(['冥想引导']), 0, null],
    ];
    contents.forEach((c) => insert.run(...c));
    console.log('· 已写入内容/音频（占位数据，音频地址待替换）');
  }

  // ---------------- 主题专栏 ----------------
  if (count('columns') === 0) {
    const cIns = db.prepare('INSERT INTO columns (title, cover, intro, sort) VALUES (?,?,?,?)');
    const ccIns = db.prepare('INSERT INTO column_contents (column_id, content_id, sort) VALUES (?,?,?)');
    const c1 = cIns.run('深夜电台', '', '睡前的声音陪伴', 1).lastInsertRowid;
    ccIns.run(c1, 3, 1); ccIns.run(c1, 4, 2); ccIns.run(c1, 5, 3);
    const c2 = cIns.run('七日疗愈', '', '一周，慢慢与自己和解', 2).lastInsertRowid;
    ccIns.run(c2, 6, 1); ccIns.run(c2, 1, 2); ccIns.run(c2, 2, 3);
    console.log('· 已写入主题专栏');
  }

  // ---------------- 线下活动（占位，用活动方案库替换） ----------------
  if (count('events') === 0) {
    const insert = db.prepare(
      'INSERT INTO events (title, cover, guide_text, start_time, end_time, location, total_slots, remaining_slots, fee, description, suitable_tags, refund_policy, is_solar_term, solar_term, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    );
    insert.run(
      '中秋·满月冥想圈', '', '在满月下，与同修一起静心',
      '2026-09-25T19:30:00', '2026-09-25T21:00:00', '共时海·成都空间',
      20, 18, 0,
      '中秋月圆之夜，颂钵与引导冥想相伴，给身心一次温柔的归港。',
      JSON.stringify(['无需基础', '适合压力人群']), '活动前 24h 可全额退，过后不退不换。',
      0, null, 'open'
    );
    insert.run(
      '秋分·节气茶会', '', '一杯茶，安住此刻',
      '2026-09-23T15:00:00', '2026-09-23T16:30:00', '共时海·成都空间',
      12, 9, 6800,
      '顺应秋分物候，以茶会友，慢煮一段属于秋天的安静。',
      JSON.stringify(['无需基础', '茶道爱好者']), '活动前 48h 可全额退。',
      1, '秋分', 'open'
    );
    console.log('· 已写入线下活动（占位数据，待替换为真实活动方案）');
  }
});

seed();
console.log('\n[OK] 数据库初始化完成：', require('../config').dbPath);
