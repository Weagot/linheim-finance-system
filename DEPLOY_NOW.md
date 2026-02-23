# 林海集团财务系统 - 部署指南

## 方案一：Vercel 部署（推荐，最简单）

### 前置条件
- GitHub 账号
- Vercel 账号（可用 GitHub 登录）

### 步骤 1：推送代码到 GitHub

```bash
# 在项目根目录执行
cd /workspace/projects/linheim-finance-system

# 初始化 Git（如果还没有）
git add .
git commit -m "feat: 林海集团财务系统"

# 创建 GitHub 仓库后推送
git remote add origin https://github.com/你的用户名/linheim-finance-system.git
git push -u origin main
```

### 步骤 2：在 Vercel 创建项目

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Add New..." → "Project"
3. 选择你的 GitHub 仓库 `linheim-finance-system`
4. 点击 "Import"

### 步骤 3：配置数据库

**选项 A：使用 Vercel Postgres（推荐）**

1. 在 Vercel 项目页面，点击 "Storage" 标签
2. 点击 "Create Database" → 选择 "Postgres"
3. 选择区域（建议选择 Hong Kong 或 Singapore）
4. 创建后会自动添加环境变量

**选项 B：使用 Supabase（扣子空间的数据库）**

1. 登录 Supabase 控制台
2. 获取数据库连接字符串
3. 在 Vercel 项目设置中添加环境变量：
   - `POSTGRES_PRISMA_URL` = 你的 Supabase 连接字符串
   - `POSTGRES_URL_NON_POOLING` = 你的 Supabase 直连字符串

### 步骤 4：配置环境变量

在 Vercel 项目设置 → Environment Variables 中添加：

```
JWT_SECRET=linheim-finance-2026-secret-key
```

### 步骤 5：部署

点击 "Deploy" 按钮，Vercel 会自动：
- 安装依赖
- 构建前端
- 部署 API 函数

### 步骤 6：初始化数据库

部署成功后，需要在 Vercel 的终端或本地执行数据库迁移：

```bash
# 本地执行（需要先设置环境变量）
npx prisma db push
```

---

## 方案二：Railway 部署（支持全栈）

### 步骤 1：推送代码到 GitHub
同方案一

### 步骤 2：在 Railway 创建项目

1. 访问 [railway.app](https://railway.app)
2. 使用 GitHub 登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择 `linheim-finance-system`

### 步骤 3：添加 PostgreSQL 数据库

1. 在项目中点击 "Add Service" → "Database" → "PostgreSQL"
2. Railway 会自动添加 `DATABASE_URL` 环境变量

### 步骤 4：配置环境变量

添加以下环境变量：
```
POSTGRES_PRISMA_URL=${{Postgres.DATABASE_URL}}
POSTGRES_URL_NON_POOLING=${{Postgres.DATABASE_URL}}
JWT_SECRET=linheim-finance-2026-secret-key
```

---

## 方案三：创建新的扣子项目（绕过开发状态）

如果还是想在扣子平台部署：

1. 在扣子空间创建**新项目**
2. 选择 "从模板创建" → Next.js
3. 把当前项目的代码复制到新项目：
   - `frontend/src/` → 新项目的 `src/`
   - `server/` → 新项目根目录
   - `api/` → 新项目根目录
4. 配置 `.coze` 文件
5. 直接部署新项目

---

## 当前项目状态

✅ 前端构建成功（frontend/dist/）
✅ API 函数已配置（api/index.ts）
✅ vercel.json 已配置

---

## 需要帮助？

如果遇到问题，请提供：
1. 具体的错误信息截图
2. 部署平台的日志输出
