# 共时海小程序 · 后端服务

共时海疗愈小程序的后端 API。**Node.js (Koa) + SQLite + JWT**，零配置可本地直接跑。

## 快速开始

```bash
cd backend
npm install
cp .env.example .env      # 本地可直接留空，进入开发模式
npm run seed              # 建表 + 写入种子数据（危机热线/节气/疗愈师/内容/活动...）
npm start                 # 启动：http://localhost:3000
```

## 验证一下

```bash
curl http://localhost:3000/api/daily-greeting
curl http://localhost:3000/api/crisis
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"code":"dev"}'
```

## 文档

- **完整搭建步骤、接口清单、微信登录/支付接入、部署与合规说明**：见 [`搭建步骤.md`](./搭建步骤.md)
- 接口默认前缀：`/api`，返回统一结构 `{ code, data, message }`

## 目录

```
backend/
├── src/app.js          入口
├── src/db/             schema.sql（建表）+ seed.js（种子）
├── src/routes/         各业务模块路由
├── src/middleware/     鉴权 + 错误处理
├── src/utils/          jwt / 微信登录 / 响应封装
└── data/               SQLite 数据库（自动生成）
```
