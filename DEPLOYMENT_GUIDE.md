# 🚀 Linheim 财务系统 - Vercel + Supabase 部署指南

## ✅ 准备工作清单

- [x] 前端MVP已完成
- [x] 后端API已完成
- [x] Vercel Serverless Functions已创建
- [ ] Supabase数据库创建
- [ ] 配置环境变量
- [ ] 部署到Vercel
- [ ] 测试和验证

---

## 📋 详细部署步骤

### 第1步：创建Supabase数据库

1. **登录Supabase**
   - 访问：https://supabase.com
   - 使用你的付费账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 项目名称：`linheim-finance-system`
   - 数据库密码：设置一个强密码（**记住这个密码！**）
   - 区域：选择离你最近的（如：Northeast Asia (Tokyo)）
   - 点击 "Create new project"
   - 等待2-3分钟，数据库创建完成

3. **获取数据库连接字符串**
   - 进入项目 → Settings → Database
   - 找到 "Connection string" 部分
   - 选择 "URI" 标签
   - 复制连接字符串，格式类似：
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
     ```

4. **创建数据库表（可选）**
   - Vercel部署时会自动运行Prisma迁移
   - 或者手动在Supabase的SQL Editor中运行迁移

---

### 第2步：配置Vercel环境变量

1. **连接GitHub到Vercel**
   - 登录 Vercel：https://vercel.com
   - 点击 "Add New" → "Project"
   - 选择 "Import Git Repository"
   - 授予Vercel访问GitHub权限
   - 选择 `Weagot/linheim-finance-system` 仓库
   - 点击 "Import"

2. **配置项目设置**
   - **Project Name**: `linheim-finance-system`
   - **Framework Preset**: 选择 "Vite"
   - **Root Directory**: 保持默认 `.`
   - **Build and Output Settings**:
     - Build Command: `npm run vercel-build`
     - Output Directory: `frontend/dist`

3. **添加环境变量（关键！）**
   在 "Environment Variables" 部分添加以下变量：

   | 名称 | 值 | 说明 |
   |------|-----|------|
   | `DATABASE_URL` | `[你的Supabase连接字符串]` | PostgreSQL数据库连接 |
   | `JWT_SECRET` | `linheim-finance-2026-secret-very-long-random-string` | JWT密钥（生产环境改这个） |
   | `NODE_ENV` | `production` | 生产环境 |

4. **点击 "Deploy"**
   - Vercel会开始构建和部署
   - 等待3-5分钟完成

---

### 第3步：更新前端API地址

部署完成后，需要更新前端API地址：

1. **在Vercel项目中**
   - 进入 Settings → Environment Variables
   - 添加新变量：
     - 名称: `VITE_API_URL`
     - 值: `https://linheim-finance-system.vercel.app/api`
   - 触发重新部署

2. **或者本地修改**
   ```bash
   # 编辑 frontend/.env
   VITE_API_URL=https://linheim-finance-system.vercel.app/api
   ```

---

### 第4步：初始化数据库

Vercel部署完成后，需要运行数据库迁移：

**选项A：通过Vercel CLI（推荐）**
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 连接到项目
vercel link

# 生成Prisma Client
cd backend
npx prisma generate

# 推送schema到数据库
npx prisma db push
```

**选项B：通过Supabase SQL Editor**
1. 进入Supabase项目 → SQL Editor
2. 复制 `backend/prisma/schema.prisma` 的内容
3. 转换为SQL语句并执行
4. 或者使用 Prisma生成的迁移文件

**选项C：通过部署后访问**
- 部署后直接访问系统
- 首次使用时会自动创建表

---

### 第5步：测试验证

1. **访问部署后的系统**
   - 打开：https://linheim-finance-system.vercel.app
   - 应该看到登录页面

2. **测试登录**
   - 使用测试账号：
     - 邮箱：`admin@linheim.com`
     - 密码：`admin123`
   - 登录成功后进入仪表盘

3. **测试各个功能**
   - [ ] 公司管理（新增、编辑、删除）
   - [ ] 财务流水（新增、编辑、删除、导出）
   - [ ] 发票管理（新增、编辑、删除、状态切换）
   - [ ] 报表中心（查看报表）

---

## 🔧 故障排查

### 问题1：部署失败

**检查：**
- 环境变量是否正确
- Supabase数据库是否可访问
- 构建日志中的错误信息

**解决：**
- 确认DATABASE_URL格式正确
- 检查Supabase项目状态
- 查看Vercel部署日志

### 问题2：数据库连接失败

**错误信息：**
```
Can't reach database server at [HOST]
```

**解决：**
- 检查Supabase项目是否暂停
- 确认DATABASE_URL正确
- 检查Supabase的网络访问设置

### 问题3：登录失败

**错误信息：**
```
Invalid credentials
```

**解决：**
- 确认后端API可访问
- 检查数据库中是否有admin用户
- 如果没有，手动创建：
  ```sql
  INSERT INTO users (id, name, email, password, role, company_access, created_at, updated_at)
  VALUES (
    'admin-id',
    'Admin',
    'admin@linheim.com',
    '$2a$10$hashed_password_from_bcrypt',
    'ADMIN',
    '[]',
    NOW(),
    NOW()
  );
  ```

### 问题4：CORS错误

**错误信息：**
```
Access to fetch at '...' has been blocked by CORS policy
```

**解决：**
- 确认前端API地址正确
- 检查Vercel域名配置
- 确认API路由正确（/api/...）

---

## 📝 后续优化建议

### 1. 数据库优化
- 添加数据库索引
- 优化查询性能
- 设置定期备份

### 2. 性能优化
- 启用Vercel Edge Functions（API路由）
- 添加Redis缓存
- 优化Prisma查询

### 3. 安全加固
- 修改JWT_SECRET
- 启用HTTPS（Vercel默认启用）
- 添加速率限制
- 启用CSP

### 4. 监控和日志
- 集成Vercel Analytics
- 设置错误监控（如Sentry）
- 配置数据库监控

---

## 🎉 完成！

部署完成后，你将拥有：
- ✅ 前后端统一在Vercel
- ✅ Supabase PostgreSQL数据库
- ✅ 全功能的财务管理系统
- ✅ 全球CDN加速
- ✅ 自动SSL证书
- ✅ 快速冷启动

---

## 📞 需要帮助？

如果遇到问题，请检查：
1. Vercel部署日志
2. Supabase项目状态
3. 浏览器控制台错误
4. 网络请求（Network标签）

---

*部署完成后，请删除本文件或移至docs目录*
