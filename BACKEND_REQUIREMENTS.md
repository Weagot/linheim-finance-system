# 后端 API 需求文档

## 概述
本文档描述了林海集团财务系统前端已实现功能所需的后端 API 接口。前端已完成开发，需要后端提供对应的 API 支持。

---

## 基础配置

### 环境变量
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="linheim-finance-2026-secret"
NODE_ENV="production"
```

### 数据库 Schema
参考文件: `prisma/schema.prisma`

---

## API 接口列表

### 1. 汇率管理 API (新增)

#### 1.1 获取所有汇率
```
GET /api/exchange-rates
```

**响应:**
```json
{
  "rates": [
    {
      "id": "string",
      "date": "2026-02-23",
      "fromCurrency": "EUR",
      "toCurrency": "CNY",
      "rate": 7.82,
      "source": "中国银行"
    }
  ]
}
```

#### 1.2 获取最新汇率
```
GET /api/exchange-rates/latest
```

**响应:**
```json
{
  "rates": [...],
  "lastUpdate": "2026-02-23T10:00:00Z",
  "source": "中国银行"
}
```

#### 1.3 获取汇率历史
```
GET /api/exchange-rates/history?from=EUR&to=CNY&days=7
```

**查询参数:**
- `from` (可选): 源货币代码
- `to` (可选): 目标货币代码
- `days` (可选): 查询天数，默认7天

**响应:**
```json
{
  "history": [
    {
      "id": "string",
      "date": "2026-02-23",
      "fromCurrency": "EUR",
      "toCurrency": "CNY",
      "rate": 7.82,
      "source": "中国银行"
    }
  ]
}
```

#### 1.4 手动更新汇率 (从外部API获取)
```
POST /api/exchange-rates/fetch
```

**功能说明:**
- 从外部汇率 API (如中国银行、欧洲央行) 获取最新汇率
- 更新数据库中的汇率记录

**响应:**
```json
{
  "success": true,
  "rates": [...],
  "message": "汇率已更新",
  "lastUpdate": "2026-02-23T10:00:00Z"
}
```

#### 1.5 手动添加汇率记录
```
POST /api/exchange-rates
```

**请求体:**
```json
{
  "date": "2026-02-23",
  "fromCurrency": "EUR",
  "toCurrency": "CNY",
  "rate": 7.82,
  "source": "手动录入"
}
```

---

### 2. 现有 API 确认

以下 API 已在后端实现，需确认功能正常：

#### 2.1 认证 API
- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `GET /api/auth/me` - 获取当前用户
- `POST /api/auth/logout` - 登出

#### 2.2 公司管理 API
- `GET /api/companies` - 获取公司列表
- `POST /api/companies` - 创建公司
- `GET /api/companies/:id` - 获取公司详情
- `PUT /api/companies/:id` - 更新公司
- `DELETE /api/companies/:id` - 删除公司

#### 2.3 财务流水 API
- `GET /api/transactions` - 获取流水列表
- `POST /api/transactions` - 创建流水
- `GET /api/transactions/:id` - 获取流水详情
- `PUT /api/transactions/:id` - 更新流水
- `DELETE /api/transactions/:id` - 删除流水

#### 2.4 发票管理 API
- `GET /api/invoices` - 获取发票列表
- `POST /api/invoices` - 创建发票
- `GET /api/invoices/:id` - 获取发票详情
- `PUT /api/invoices/:id` - 更新发票
- `DELETE /api/invoices/:id` - 删除发票

#### 2.5 报表 API
- `GET /api/reports/profit-loss` - 利润表
- `GET /api/reports/cash-flow` - 现金流
- `GET /api/reports/company-summary` - 公司汇总

---

## 数据库模型

### ExchangeRate 模型 (新增)
```prisma
model ExchangeRate {
  id            String   @id @default(uuid())
  date          DateTime
  fromCurrency  String   // EUR, CNY, USD, GBP, HKD
  toCurrency    String   // EUR, CNY, USD, GBP, HKD
  rate          Float
  source        String   // 来源：中国银行、手动录入等
  createdAt     DateTime @default(now())

  @@unique([date, fromCurrency, toCurrency])
  @@map("exchange_rates")
}
```

---

## 外部汇率 API 集成建议

### 推荐方案
1. **欧洲央行 (ECB)** - 免费，每日更新
   - URL: `https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml`
   - 支持 EUR 到其他货币的汇率

2. **中国银行** - 手动录入或爬取
   - 作为备用数据源

### 实现建议
```typescript
// 示例：定时任务获取汇率
import cron from 'node-cron';

// 每天早上 8 点更新汇率
cron.schedule('0 8 * * *', async () => {
  const rates = await fetchLatestRatesFromECB();
  await saveRatesToDatabase(rates);
});
```

---

## 前端已完成功能

### 1. 汇率管理页面
- 路由: `/exchange-rates`
- 功能:
  - 显示实时汇率卡片
  - 货币换算器
  - 历史汇率查询
  - 自动/手动更新汇率
  - 导出汇率记录到 Excel

### 2. Excel 导出功能
- 所有列表页面支持导出为 Excel
- 报表页面支持多 Sheet 导出

### 3. 移动端适配
- 响应式侧边栏
- 移动端菜单
- 各页面移动端布局优化

---

## 部署注意事项

1. **数据库迁移**: 运行 `npx prisma migrate dev` 创建 exchange_rates 表
2. **定时任务**: 配置汇率自动更新任务
3. **CORS 配置**: 确保前端域名在允许列表中
4. **环境变量**: 配置正确的数据库连接和 JWT 密钥

---

## 测试用例

### 汇率 API 测试
```bash
# 获取所有汇率
curl http://localhost:3001/api/exchange-rates

# 获取最新汇率
curl http://localhost:3001/api/exchange-rates/latest

# 获取历史汇率
curl "http://localhost:3001/api/exchange-rates/history?from=EUR&to=CNY&days=7"

# 手动更新汇率
curl -X POST http://localhost:3001/api/exchange-rates/fetch
```

---

## 联系方式
如有问题，请联系前端开发团队。
