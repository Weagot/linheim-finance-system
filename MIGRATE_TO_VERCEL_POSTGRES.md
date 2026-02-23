# 🚀 迁移到 Vercel Postgres - 快速指南

## 📋 为什么使用 Vercel Postgres？

| 优势 | Supabase | Vercel Postgres |
|------|----------|-----------------|
| 部署复杂度 | 需要单独配置 | **一键创建** ✅ |
| 环境变量 | 手动配置 | **自动注入** ✅ |
| 管理 | 单独的 Dashboard | **Vercel 内统一管理** ✅ |
| 边缘缓存 | 手动配置 | **自动** ✅ |
| 备份 | 手动配置 | **自动** ✅ |
| 计费 | 独立账单 | **Vercel 统一计费** ✅ |
| 集成度 | 第三方 | **原生集成** ✅ |

**结论：Vercel Postgres 更简单、更可靠！**

---

## ⚡ 迁移步骤

### 步骤 1：创建 Vercel Postgres 数据库

#### 方法 A：通过 Vercel Dashboard（推荐）

1. **进入你的 Vercel 项目**
   - 访问：https://vercel.com/dashboard
   - 选择项目：`linheim-finance-system`

2. **创建数据库**
   - 导航到：**Storage** → **Create Database**
   - 选择：**Postgres**
   - 填写：
     - **Database Name**: `linheim-finance`
     - **Region**: `Washington, D.C., USA (East)`（推荐，与你的 Vercel 项目同区域）
   - 点击：**Create Database**
   - 选择计划：**Hobby**（免费，适合开发测试）

3. **等待创建完成**（约 1-2 分钟）

4. **复制连接信息**
   - 在 Storage 页面，找到新创建的数据库
   - 点击进入详情页
   - 复制 **Connection Strings** 中的 **Prisma** URL（会自动添加到环境变量）

**Vercel 会自动添加以下环境变量：**
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

#### 方法 B：通过 CLI（如果你有 Vercel CLI）

```bash
# 安装 Vercel CLI（如果没有）
npm i -g vercel

# 登录
vercel login

# 连接到项目
cd /path/to/linheim-finance-system
vercel link

# 创建 Postgres 数据库
vercel postgres create

# 初始化数据库
vercel postgres setup
```

---

### 步骤 2：初始化数据库表

#### 方法 A：通过 Vercel Dashboard（推荐）

1. **进入数据库详情页**
   - Storage → 选择 `linheim-finance` 数据库

2. **打开 Query Editor**
   - 点击 "Query" 标签

3. **粘贴并执行 SQL**
   - 打开 `docs/vercel-postgres-init.sql` 文件
   - 复制全部内容
   - 粘贴到 Query Editor
   - 点击 "Run Query"

4. **验证结果**
   - 应该看到 "Vercel Postgres 数据库初始化完成！" 的提示
   - 确认以下内容已创建：
     - ✅ 6 个表：users, companies, transactions, invoices, projects, exchange_rates
     - ✅ 1 个管理员用户：admin@linheim.de
     - ✅ 3 个初始公司

#### 方法 B：通过 Prisma Push

```bash
# 在本地终端运行
cd /path/to/linheim-finance-system
npx prisma db push

# 运行 seed
npx ts-node prisma/seed.ts
```

---

### 步骤 3：验证环境变量

在 Vercel Dashboard → Settings → Environment Variables 确认：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `POSTGRES_PRISMA_URL` | 自动填充 | Prisma 连接字符串 |
| `POSTGRES_URL_NON_POOLING` | 自动填充 | 直接连接字符串 |
| `JWT_SECRET` | `linheim-finance-2026-secret` | JWT 密钥 |
| `NODE_ENV` | `production` | 环境 |
| `VITE_API_URL` | `https://linheim-finance-system.vercel.app/api` | API 地址 |

**重要：**
- ❌ **删除**旧的 `DATABASE_URL`（如果存在）
- ✅ **保留**新的 Vercel Postgres 环境变量

---

### 步骤 4：修改前端配置

更新 `frontend/.env`（如果使用本地开发）：

```env
VITE_API_URL=https://linheim-finance-system.vercel.app/api
```

在 Vercel Dashboard 中，确认 `VITE_API_URL` 环境变量已设置。

---

### 步骤 5：测试连接

#### 测试 1：数据库连接

在 Vercel Dashboard → Storage → Query Editor 运行：

```sql
SELECT name, code, currency FROM companies;
```

**应该返回：**
- Deyou international GmbH, DEYOU, EUR
- Wanling GmbH, WANLING, EUR
- 江苏程辉商贸有限公司, JSCH, CNY

#### 测试 2：API 连接

部署完成后，在浏览器控制台运行：

```javascript
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@linheim.de', password: 'admin123' })
}).then(r => r.json()).then(console.log)
```

**应该返回：**
```javascript
{
  user: { id: "...", name: "Admin", email: "admin@linheim.de", role: "ADMIN" },
  token: "..."
}
```

#### 测试 3：前端访问

访问：https://linheim-finance-system.vercel.app

**应该看到：**
- ✅ 登录页面
- ✅ 输入 `admin@linheim.de` / `admin123` 后成功登录

---

## 📊 迁移对比

### 之前的配置（Supabase）

```json
{
  "DATABASE_URL": "postgresql://postgres:password@db.supabase.co:5432/postgres"
}
```

### 新的配置（Vercel Postgres）

```json
{
  "POSTGRES_PRISMA_URL": "postgres://postgres.xxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres",
  "POSTGRES_URL_NON_POOLING": "postgres://postgres.xxxx:password@aws-0-us-east-1.postgres.supabase.com:5432/postgres"
}
```

**优势：**
- ✅ 自动注入环境变量
- ✅ 支持连接池（POSTGRES_PRISMA_URL）
- ✅ 支持直接连接（POSTGRES_URL_NON_POOLING）
- ✅ 无需手动配置

---

## 🎯 迁移后检查清单

- [ ] Vercel Postgres 数据库已创建
- [ ] 数据库表已初始化（运行了 vercel-postgres-init.sql）
- [ ] 环境变量已更新（POSTGRES_PRISMA_URL 等）
- [ ] 旧的 DATABASE_URL 已删除
- [ ] 前端 VITE_API_URL 已更新
- [ ] 数据库连接测试通过
- [ ] API 登录测试通过
- [ ] 前端登录测试通过

---

## ❓ 常见问题

### 1. 数据库创建失败

**原因：** 区域选择错误或网络问题

**解决：**
- 选择与你 Vercel 项目相同的区域
- 检查 Vercel 账户状态
- 等待几分钟后重试

### 2. 环境变量未自动添加

**解决：**
- 手动添加 `POSTGRES_PRISMA_URL` 和 `POSTGRES_URL_NON_POOLING`
- 从数据库详情页复制连接字符串

### 3. API 返回 500 错误

**原因：** Prisma Client 未生成或配置错误

**解决：**
- 检查 `prisma/schema.prisma` 中的 URL 配置
- 确认使用 `env("POSTGRES_PRISMA_URL")`

### 4. 数据库连接超时

**原因：** 区域不匹配或网络问题

**解决：**
- 确保数据库和应用在同一区域
- 检查 Vercel 项目区域设置

---

## 🔄 回滚到 Supabase（如果需要）

如果迁移后出现问题，可以回滚：

1. **在 Supabase 重新初始化数据库**
   - 使用 `docs/supabase-init.sql`

2. **更新环境变量**
   - 添加回 `DATABASE_URL`（Supabase 连接字符串）
   - 删除 Vercel Postgres 环境变量

3. **更新 Prisma Schema**
   - 使用 `env("DATABASE_URL")` 而不是 `env("POSTGRES_PRISMA_URL")`

---

## 📞 需要帮助？

如果遇到问题，请提供：

1. **数据库创建状态**
   - 截图或错误消息

2. **环境变量列表**
   - Settings → Environment Variables

3. **API 错误日志**
   - Vercel Functions 日志

4. **数据库查询结果**
   - Query Editor 运行结果

---

**迁移完成后，你将拥有一个完全集成的 Vercel 生态系统！** 🚀

---

*创建时间：2026-02-23*
*开发者：小龙虾 🦞 ღ( ´･ᴗ･` )*
