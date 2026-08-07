# 共时海小程序 · 后端服务

共时海疗愈小程序的后端 API。**Node.js (Koa) + SQLite + JWT**，零配置可本地直接跑。

## 快速开始

```bash
cd backend
npm install
cp .env.example .env      # 本地可直接留空，进入开发模式
npm run init-db           # 建表 + 写入种子数据（危机热线/节气/疗愈师/内容/活动...）
npm start                 # 启动：http://localhost:3300
```

> **端口**：默认 `3300`（在 `.env` 的 `PORT` 配置）。本机 3000 常被其他项目占用，共时海固定用 3300，前端 `config.js` 已对齐。

## 验证

```bash
curl http://localhost:3300/api/contents
curl http://localhost:3300/api/healers
curl -X POST http://localhost:3300/api/auth/login -H "Content-Type: application/json" -d '{"code":"dev"}'
```

## 管理后台

启动后浏览器打开 `http://localhost:3300/index.html` —— 8 面板 SPA（内容/疗愈师/活动/订单/用户/共修圈/配置），已接真实 API。

## 目录

```
backend/
├── src/app.js          入口
├── src/db/             schema.sql（建表）+ seed.js（种子）
├── src/routes/         各业务模块路由（接口契约源）
├── src/middleware/     鉴权 + 错误处理
├── src/utils/          jwt / 微信登录 / 响应封装
├── admin/index.html    管理后台 SPA
└── data/               SQLite 数据库（自动生成，gitignore）
```

## 接口契约

- 前缀 `/api`，统一返回 `{ code, data, message }`（`code:0` 为成功）
- 需登录接口带 `Authorization: Bearer <token>`
- 开发模式（未配 `WX_APPID`）：任意 code（如 `"dev"`）可直接登录
- **接口清单以代码为准**：见 `src/routes/*.js`

> 完整搭建步骤、微信登录/支付/部署/合规说明：见知识库 `GSH/03-搭建指南/后端搭建步骤.md`。
