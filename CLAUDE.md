# 共时海小程序 · 项目约定

> 这是 Claude Code 的工作指南。开始任何任务前先读本文件。

## 项目概览

「共时海」疗愈微信小程序。原生小程序前端 + 自建 Node 后端。

- **前端**：`frontend/miniprogram/`（原生 WXML/WXSS/JS，33 页 + 4 Tab + 分包）
- **后端**：`backend/`（Koa + SQLite + JWT，13 路由，`admin/index.html` 管理后台）
- **原型**：`prototypes/html/`（33 个 HTML 原型，开发视觉参考）

## 工作约定

- **改动后主动 commit + push** 到 `origin/main`，中文 `type: 描述` 格式（`feat/fix/refactor/chore/docs`）
- 本项目长期约定：「有更改就提交推送」，无需每次再问
- push 失败先诊断网络（国内连 GitHub 常超时），可用 `git -c http.version=HTTP/1.1 push` 降级，别盲目重试

## 运行信息（关键，别踩坑）

- **后端端口：3300**（不是 3000！本机 3000 被 MeiMart 项目占用，共时海固定 3300）
- 前端 `frontend/miniprogram/config.js` 的 dev baseUrl = `http://localhost:3300`，与后端对齐
- 启动后端：`cd backend && npm start`（首次需 `npm install` + `npm run init-db`）
- 管理后台：`http://localhost:3300/index.html`
- 微信开发者工具联调：勾「不校验合法域名」（免认证本地联调）
- **不要 kill 3000 端口的进程**（那是 MeiMart）

## 接口契约

- 前缀 `/api`，统一 `{ code, data, message }`，`code:0` 成功
- 登录 `POST /api/auth/login`，开发模式任意 code（如 `"dev"`）可登录
- **接口清单以代码为准**：`backend/src/routes/*.js`

## 文档与知识库

项目内只保留必要文档（README + 本文件）。**完整的设计/架构/搭建/规划文档已移至 Obsidian 知识库**，需要查细节时去这里读：

```
/Users/linsuwei/DevAll/Obsidian/Work-Wiki/Work-Wiki/WeChatMiNiProgram/GSH/
├── 01-设计文档/   设计理念 / 页面架构 / 交互逻辑 / 扩展规划 / 上线大纲 / 视觉预览
├── 02-架构方案/   共时海架构方案 v3（项目全貌与状态）
├── 03-搭建指南/   后端 / 前端搭建步骤
├── 04-开发参考/   页面-接口映射 / API契约与路由接口 / 后台管理盘点 / 设计交付规范 / 原型任务安排
└── 下一步计划/    下一步行动计划
```

## 当前阶段

代码工程就绪（33 页 + 后端 + 后台），进入「微信合规前置 + 素材灌库 + 提审」阶段。
下一步行动见知识库 `下一步计划/共时海小程序-下一步行动.md`。
