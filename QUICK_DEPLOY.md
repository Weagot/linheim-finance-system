# 🚀 快速部署指南 - Vercel + Supabase

## 📝 已完成的工作

✅ 前端 MVP（已完成并部署到 Vercel）
✅ 后端 API（已转换为 Vercel Serverless Functions）
✅ 数据库表结构设计（Prisma Schema）
✅ 初始化 SQL 脚本

---

## ⚡ 快速部署步骤

### 第 1 步：在 Supabase 中初始化数据库

1. 登录 Supabase: https://supabase.com
2. 进入你的项目 → SQL Editor
3. 创建新查询
4. 复制 `docs/supabase-init.sql` 的全部内容
5. 粘贴到 SQL Editor 中
6. 点击 "Run" 执行
7. 确认看到 "数据库初始化完成！" 的提示

**初始管理员账号：**
- 邮箱：`admin@linheim.de`
- 密码：`admin123`

---

### 第 2 步：确认 Vercel 环境变量

进入 Vercel 项目 → Settings → Environment Variables，确保以下变量已设置：

| 名称 | 值 |
|------|-----|
| `DATABASE_URL` | `postgresql://postgres:e1ETfOEQrCkw05Xt@db.fhwjruexfykppqybfeow.supabase.co:5432/postgres` |
| `JWT_SECRET` | `linheim-finance-2026-secret` |
| `NODE_ENV` | `production` |
| `VITE_API_URL` | `https://linheim-finance-system.vercel.app/api` |

**重要：** 确保没有引号！

---

### 第 3 步：推送代码到 GitHub

```bash
git add .
git commit -m "feat: add Vercel Serverless Functions API"
git push origin main
```

Vercel 会自动检测到更改并开始部署。

---

### 第 4 步：等待部署完成

1. 在 Vercel Dashboard 查看部署状态
2. 等待 3-5 分钟完成构建
3. 确保没有错误

---

### 第 5 步：测试系统

1. **访问系统**
   - 打开：https://linheim-finance-system.vercel.app
   - 应该看到登录页面

2. **测试登录**
   - 邮箱：`admin@linheim.de`
   - 密码：`admin123`

3. **测试 API（在浏览器控制台）**
   - 打开开发者工具（F12）
   - Console 标签中运行：
   ```javascript
   fetch('/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email: 'admin@linheim.de', password: 'admin123' })
   }).then(r => r.json()).then(console.log)
   ```
   - 应该返回带有 token 和 user 的 JSON

4. **测试各个功能**
   - [ ] 公司管理（新增、编辑、删除公司）
   - [ ] 财务流水（记录收支）
   - [ ] 发票管理（创建发票）
   - [ ] 报表中心（查看报表）

---

## ❓ 常见问题

### 部署失败

**检查清单：**
- ✅ 环境变量是否正确（没有引号）
- ✅ Supabase 数据库是否在线
- ✅ 查看 Vercel 部署日志

### 登录失败

**可能原因：**
- 数据库未初始化（运行 SQL 脚本）
- 密码错误（确保是 `admin123`）
- 邮箱错误（确保是 `admin@linheim.de`）

### API 返回 500 错误

**检查：**
- 数据库连接是否正常
- 查看 Vercel Functions 日志

### CORS 错误

**确保：**
- 前端 API 地址正确（VITE_API_URL）
- Vercel 域名正确

---

## 🔒 安全建议

1. **修改初始密码**
   - 登录后立即修改 `admin@linheim.de` 的密码
   - 或创建新的管理员账号并删除默认账号

2. **更新 JWT_SECRET**
   - 当前：`linheim-finance-2026-secret`
   - 建议改为更长的随机字符串

3. **启用两步验证（2FA）**
   - 在 Supabase 中启用
   - 保护数据库访问

---

## 📞 需要帮助？

如果遇到问题，请检查：

1. **Vercel 部署日志** - 查看构建错误
2. **Supabase 项目状态** - 确保数据库在线
3. **浏览器控制台** - 查看前端错误
4. **Network 标签** - 查看 API 请求状态

---

## 🎉 完成！

部署完成后，你将拥有：

✅ 完整的财务管理系统
✅ 前后端统一部署在 Vercel
✅ Supabase PostgreSQL 数据库
✅ 全球 CDN 加速
✅ 自动 SSL 证书
✅ 现代化的 React 前端

祝使用愉快！🚀

---

*部署完成后，可以将此文件移至 docs 目录*
