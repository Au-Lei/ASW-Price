# ASW Smart Freight

智能海运报价系统第一版（MVP 演示版）：展示合同管理、智能询价、方案比较与推荐。项目采用 Vue 3、Vite 与 Element Plus 构建，所有业务数据均为前端 Mock，无需后端服务即可完成演示。

## 已实现

- 工作台：核心业务数据、最近询价、合同概览与快捷入口
- 合同管理：合同列表、状态展示、模拟 AI 上传解析与确认导入
- 智能询价：起运港、目的港、柜型、出货日期及报价偏好
- 方案比较：COSCO、ONE、EMC 三套方案，展示价格、时效、评分及推荐理由
- 询价记录：历史询价及推荐结果列表
- 自适应侧边导航与完整的交互反馈

## 本地运行

需要 Node.js 20.19+ 或 22.12+。

```bash
npm install
npm run dev
```

浏览器访问终端中显示的本地地址（通常为 `http://localhost:5173`）。

如果浏览器提示 `ERR_CONNECTION_REFUSED`，说明开发服务器未启动。请保持运行 `npm run dev` 的终端窗口打开，然后刷新页面。

在限制 Node 启动子进程的 Windows 环境里，如果 Vite 启动时报 `spawn EPERM`，可以用静态预览方式：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-preview.ps1
node scripts/serve-preview.mjs
```

第二个命令需要持续运行；关闭终端后网页就无法访问。这份预览由相同的 Vue 源码生成，适合现场演示。

## 生产构建

```bash
npm run build
npm run preview
```

构建产物位于 `dist/`。

## 服务器演示部署

本项目当前为纯前端演示版，可将 `dist/` 作为静态网站放到 Nginx；无需在服务器上常驻运行 Vite。`deploy/nginx.conf.example` 提供基础配置模板。部署前需按实际服务器的域名或公网 IP、操作系统和已有 Web 服务调整配置，并开放相应的 HTTP/HTTPS 入口。当前页面与报价数据均为公开可见的 Mock，勿将真实客户合同放进前端源码。

## 推荐演示流程

1. 从工作台介绍业务总览，点击“上传合同”。
2. 在合同管理弹窗点击上传区域，演示 AI 解析效果，再确认导入。
3. 进入智能询价，保留默认的“上海 → 洛杉矶、40HQ、综合推荐”。
4. 点击“查询最优方案”，对比综合推荐、最低价格和最快方案。
5. 展开讲解每套方案的评分依据及 AI 推荐理由。

## 说明

当前版本定位为产品概念验证，合同解析、船期、舱位、报价与 AI 推荐均为 Mock。后续可逐步接入 Spring Boot / MySQL、真实合同解析、船期接口及权限体系。

