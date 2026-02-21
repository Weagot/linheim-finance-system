# Vercel + Supabase 部署指南

## 🎯 当前状态

✅ 前端MVP已完成并部署到Vercel
✅ 后端API代码已完成（Express + Prisma）
📝 需要改造成Vercel Serverless Functions

## 🚀 快速部署步骤

### 第1步：准备Supabase

1. **创建Supabase项目**
   - 登录 Supabase Dashboard
   - 点击 "New Project"
   - 设置项目名称：`linheim-finance`
   - 设置密码（记住这个密码）
   - 选择区域（选择离你最近的）
   - 等待创建完成（约1-2分钟）

2. **获取数据库连接字符串**
   - 进入项目 → Settings → Database
   - 找到 "Connection string" → "URI"
   - 复制连接字符串（格式：`postgresql://postgres.xxx:password@xxx.xxx.supabase.co:5432/postgres`）

### 第2步：更新项目配置

1. **修改Prisma Schema**
   ```bash
   # 编辑 backend/prisma/schema.prisma
   # 将 provider 从 "sqlite" 改为 "postgresql"
   ```

2. **更新环境变量**
   ```bash
   # 在Vercel项目设置中添加环境变量
   DATABASE_URL=<你的Supabase连接字符串>
   JWT_SECRET=你的随机密钥（如：linheim-finance-2026-secret）
   ```

3. **运行数据库迁移**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma generate
   ```

### 第3步：部署到Vercel

**选项A：直接使用Vercel Functions（推荐）**

1. **改造成Serverless Functions**
   - 已创建部分API在 `api/` 目录
   - 需要完成剩余的API路由

2. **连接GitHub并部署**
   - Vercel → Add New Project
   - 选择 `Weagot/linheim-finance-system`
   - 配置Root Directory: `.`
   - 配置环境变量
   - 点击Deploy

**选项B：使用Render部署后端（更快）**

如果你觉得Serverless改造太复杂，可以用Render部署后端：

1. **部署后端到Render**
   - 访问 https://render.com
   - 创建账号
   - New → Web Service
   - Connect GitHub
   - 选择仓库
   - 配置：
     * Build Command: `cd backend && npm install && npx prisma generate && npm run build`
     * Start Command: `cd backend && npm run start`
   - 添加环境变量
   - Deploy

2. **更新前端API地址**
   ```bash
   # 在 frontend/.env 中
   VITE_API_URL=https://你的render-app-name.onrender.com/api
   ```

## 🎯 我的建议

**推荐：Render部署后端** - 更快，无需改造代码

原因：
- ✅ 现有代码无需改动
- ✅ 配置简单，15分钟完成
- ✅ 免费版支持PostgreSQL
- ✅ 稳定可靠

**后续：迁移到Vercel Serverless** - 当需要更大规模时

## 📝 需要我帮你做什么？

请选择：

**A. 我帮你完成Vercel Serverless改造**
   - 需要时间：30-60分钟
   - 优点：前后端统一在Vercel

**B. 我帮你快速用Render部署**
   - 需要时间：15-20分钟
   - 优点：快速上线，无需改造代码

**C. 我给你提供详细文档，你自己部署**
   - 需要时间：你操作，我指导

你选哪个？我推荐**B选项**，最快上线 🚀
