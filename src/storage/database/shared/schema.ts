import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  float,
  serial,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ==================== 系统表（保持不变）====================
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// ==================== 用户管理 ====================
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 128 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password").notNull(),
    role: varchar("role", { length: 32 }).default("VIEWER").notNull(), // ADMIN, FINANCE, COMPANY_ADMIN, VIEWER
    companyAccess: text("company_access").default("[]"), // JSON array of company IDs
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
  ]
);

// ==================== 公司管理 ====================
export const companies = pgTable(
  "companies",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 32 }).notNull().unique(), // DEYOU, WANLING, JSCH
    currency: varchar("currency", { length: 8 }).default("EUR").notNull(), // EUR, CNY, USD, GBP, HKD
    country: varchar("country", { length: 64 }).notNull(),
    type: varchar("type", { length: 64 }).notNull(), // warehouse, hr, billing
    initialBalance: float("initial_balance").default(0),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("companies_code_idx").on(table.code),
  ]
);

// ==================== 财务流水 ====================
export const transactions = pgTable(
  "transactions",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    companyId: varchar("company_id", { length: 36 }).notNull(),
    type: varchar("type", { length: 32 }).default("INCOME").notNull(), // INCOME, EXPENSE, TRANSFER
    amount: float("amount").notNull(),
    currency: varchar("currency", { length: 8 }).default("EUR").notNull(),
    category: varchar("category", { length: 64 }).notNull(),
    description: text("description"),
    date: timestamp("date", { withTimezone: true }).notNull(),
    relatedCompanyId: varchar("related_company_id", { length: 36 }), // 转账时关联的公司
    relatedTransactionId: varchar("related_transaction_id", { length: 36 }), // 转账时配对的流水ID
    invoiceId: varchar("invoice_id", { length: 36 }), // 关联的发票ID
    projectId: varchar("project_id", { length: 36 }), // 关联的项目ID
    createdBy: varchar("created_by", { length: 36 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("transactions_company_idx").on(table.companyId),
    index("transactions_date_idx").on(table.date),
    index("transactions_type_idx").on(table.type),
  ]
);

// ==================== 发票管理 ====================
export const invoices = pgTable(
  "invoices",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    invoiceNumber: varchar("invoice_number", { length: 64 }).notNull().unique(),
    invoiceDate: timestamp("invoice_date", { withTimezone: true }).notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }),
    amount: float("amount").notNull(),
    currency: varchar("currency", { length: 8 }).default("EUR").notNull(),
    issuerCompanyId: varchar("issuer_company_id", { length: 36 }).notNull(),
    receiverCompanyId: varchar("receiver_company_id", { length: 36 }),
    receiverName: varchar("receiver_name", { length: 255 }), // 收票客户名（非内部公司时）
    status: varchar("status", { length: 32 }).default("DRAFT").notNull(), // DRAFT, ISSUED, PAID, OVERDUE
    fileUrl: text("file_url"), // 发票文件路径
    relatedTransactionId: varchar("related_transaction_id", { length: 36 }), // 关联的财务流水ID
    createdBy: varchar("created_by", { length: 36 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("invoices_number_idx").on(table.invoiceNumber),
    index("invoices_status_idx").on(table.status),
    index("invoices_issuer_idx").on(table.issuerCompanyId),
  ]
);

// ==================== 汇率记录 ====================
export const exchangeRates = pgTable(
  "exchange_rates",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    date: timestamp("date", { withTimezone: true }).notNull(),
    fromCurrency: varchar("from_currency", { length: 8 }).notNull(), // EUR, CNY, USD, GBP, HKD
    toCurrency: varchar("to_currency", { length: 8 }).notNull(), // EUR, CNY, USD, GBP, HKD
    rate: float("rate").notNull(),
    source: varchar("source", { length: 64 }).notNull(), // 来源：中国银行、手动录入等
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("exchange_rates_unique_idx").on(table.date, table.fromCurrency, table.toCurrency),
  ]
);

// ==================== 项目管理（后期）====================
export const projects = pgTable(
  "projects",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }),
    status: varchar("status", { length: 32 }).default("ACTIVE").notNull(), // ACTIVE, COMPLETED, CANCELLED
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  }
);

// ==================== TypeScript 类型导出 ====================
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type Project = typeof projects.$inferSelect;
