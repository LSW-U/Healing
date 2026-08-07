# 共时海小程序 · 前端工程

「共时海」微信小程序的**前端工程**。后端见 `../backend`（Koa + SQLite + JWT）。

## 目录结构

```
frontend/
├── README.md                 ← 本文件
└── miniprogram/              ← 用「微信开发者工具」打开的小程序工程
    ├── project.config.json   微信项目配置
    ├── app.json              全局配置（4 Tab + 窗口 + 页面注册 + 分包）
    ├── app.js / app.wxss     启动逻辑 + 设计 token
    ├── config.js             环境配置（dev = 本地联调地址）
    ├── utils/                request / api / auth / util
    ├── components/           tide-ring / content-card / player-bar / bottom-sheet
    ├── custom-tab-bar/       自定义底部 Tab（潮汐波浪动画）
    ├── pages/                主包 9 页
    ├── subpackages/          shore / island / phase3 分包（24 页）
    └── assets/               图标资源
```

## 怎么开始

1. 装「微信开发者工具」（稳定版，选「小程序」）
2. 「导入项目」→ 目录选 `frontend/miniprogram`
3. AppID 用已注册的小程序 AppID；**未认证也能本地开发**
4. 后端先跑起来：`cd ../backend && npm install && npm run init-db && npm start`（默认 `http://localhost:3300`）
5. 开发者工具「详情 → 本地设置」勾选 **「不校验合法域名、TLS、HTTPS 证书」** —— 免认证联调的关键
6. 编译运行，小程序请求 `localhost:3300`

## 关键认知

> `../prototypes/html/p01~p33` 是**带手机外壳的可视化预览**，不是小程序源码。
> 真实小程序不需要那个黑色手机框和状态栏——它们由微信系统提供。
> 转换时**只取原型里 `.p-xxx` 容器内的内容**，顶栏交给 `navigationBar`、底部 4 Tab 交给 `tabBar`。
> `config.js` 的 dev baseUrl 已写死 `localhost:3300`，与后端端口对齐。

> 页面-接口映射、设计交付规范、完整搭建流程：见知识库 `GSH/04-开发参考/` 与 `GSH/03-搭建指南/前端搭建步骤.md`。
