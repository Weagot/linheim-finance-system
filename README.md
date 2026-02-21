# Linheim Group Finance System
# 林海集团财务系统

## 📋 项目简介

为 Deyou Group 集团开发的内部财务管理系统，支持多公司、多币种、自动开票等功能。

## 🏢 集团公司

- **Deyou international GmbH** (德国) - 海外仓及物流公司
- **Wanling GmbH** (德国) - 人力资源公司
- **江苏程辉商贸有限公司** (中国) - 人民币开票公司
- [未来] 英国公司、香港公司

## 🛠 技术栈

### 前端
- React 18 + TypeScript
- Tailwind CSS
- React Router
- React Query (数据缓存)
- jsPDF (PDF生成)

### 后端
- Node.js + Express
- TypeScript
- Prisma ORM
- RESTful API

### 数据库
- SQLite (初期，可迁移到 PostgreSQL)

### 部署
- GitHub (代码仓库)
- Vercel (部署平台)

## 📁 项目结构

```
finance-system/
├── frontend/          # 前端项目 (React)
├── backend/           # 后端项目 (Node.js)
├── shared/            # 共享类型和工具
├── docs/              # 文档
└── README.md          # 项目说明
```

## 🚀 开发计划

### 阶段 1：MVP (3-4周)
- [x] 项目初始化
- [x] 用户认证系统
- [x] API后端实现
- [ ] 公司管理UI
- [ ] 财务流水录入UI
- [ ] 公司间转账
- [ ] 自动生成发票
- [ ] 基础报表
- [ ] 部署上线

### 阶段 2：增强版
- [ ] 多币种汇率自动更新
- [ ] 高级报表
- [ ] Excel导出
- [ ] 数据备份

### 阶段 3：完整版
- [ ] TEMU项目对账系统
- [ ] 包裹数据导入
- [ ] 自动化报表推送

## ⚡ 性能目标

- 所有操作响应时间 < 500ms
- 通过 React 缓存、懒加载、Code Splitting 优化
- Vercel CDN 全球加速

## 👥 用户角色

- **老板** - 所有权限
- **财务人员** - 全部/部分权限
- **各公司负责人** - 只看自己公司
- **合伙人** - 老板权限

---

*Developed by 小龙虾 ღ( ´･ᴗ･` )*
