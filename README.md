# BeeStudy - 每日打卡系统

一个基于 React + TypeScript + Express + PostgreSQL 的儿童学习打卡应用。

## 功能特性

- **今日打卡**：按学科和类型（复习/预习/作业）展示每日任务，支持打卡、撤销
- **学科中心**：按学科查看任务完成情况，支持筛选
- **奖励中心**：星星奖励系统，可兑换礼品
- **我的成长**：打卡统计、28天热力图、徽章系统、等级系统
- **家长中心**：审批打卡、管理任务、发送消息、审批兑换申请

## 技术栈

- **前端**：React 19 + TypeScript + Vite + Tailwind CSS 4
- **后端**：Express + TypeScript
- **数据库**：PostgreSQL
- **图标**：Lucide React

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 设置数据库

运行数据库设置向导：

```bash
node setup-db.mjs
```

按提示输入 PostgreSQL 连接信息，脚本会自动：
- 创建数据库
- 创建数据表
- 初始化默认数据

### 3. 配置环境变量

设置完成后，脚本会提示您更新 `.env` 文件：

```env
PGHOST=localhost
PGPORT=5432
PGDATABASE=beestudy
PGUSER=your_user
PGPASSWORD=your_password
PORT=3001
```

### 4. 启动应用

同时启动前端和后端：

```bash
npm run dev:both
```

或分别启动：

```bash
# 启动后端（端口 3001）
npm run dev:server

# 启动前端（端口 5173）
npm run dev
```

访问 http://localhost:5173

## 项目结构

```
beestudy/
├── server/              # 后端代码
│   ├── index.ts        # Express 服务器
│   └── db.ts           # 数据库连接和初始化
├── src/
│   ├── components/     # 组件
│   │   └── layout/     # 布局组件
│   ├── pages/          # 页面
│   │   ├── child/      # 孩子页面
│   │   │   ├── Today.tsx
│   │   │   ├── Subjects.tsx
│   │   │   ├── Rewards.tsx
│   │   │   └── Growth.tsx
│   │   └── parent/     # 家长页面
│   │       └── ParentCenter.tsx
│   ├── lib/            # 工具库
│   │   ├── api.ts      # API 客户端
│   │   └── store.tsx   # 全局状态
│   ├── App.tsx         # 路由配置
│   ├── main.tsx        # 入口文件
│   └── index.css       # 全局样式
├── .env                # 环境变量
├── setup-db.mjs        # 数据库设置脚本
└── package.json
```

## 数据库表结构

- **users**：用户表（家长/孩子）
- **tasks**：任务表（学科、类型、标题、描述、星期）
- **checkin_logs**：打卡记录表（任务、日期、时长、自评、状态）
- **reward_items**：奖励商品表
- **redemptions**：兑换记录表
- **parent_messages**：家长留言表

## 开发命令

```bash
npm run dev          # 启动前端开发服务器
npm run dev:server   # 启动后端开发服务器
npm run dev:both     # 同时启动前后端
npm run build        # 构建生产版本
npm run lint         # 代码检查
```

## 默认数据

系统初始化后会创建：
- 2 个用户（家长、小明）
- 9 个默认任务（语文 3 个、数学 3 个、英语 3 个）
- 6 个奖励商品

## 注意事项

1. 确保 PostgreSQL 服务已启动
2. 确保有创建数据库的权限
3. 首次运行需要执行 `setup-db.mjs` 初始化数据库
