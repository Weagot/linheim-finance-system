-- 林海集团财务系统数据库初始化脚本

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(128) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'VIEWER',
  company_access TEXT DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- 公司表
CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(32) NOT NULL UNIQUE,
  legal_name VARCHAR(255),
  tax_id VARCHAR(64),
  currency VARCHAR(8) NOT NULL DEFAULT 'EUR',
  country VARCHAR(64),
  address TEXT,
  contact_info TEXT,
  type VARCHAR(64) NOT NULL,
  initial_balance FLOAT DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS companies_code_idx ON companies(code);

-- 财务流水表
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR(36) NOT NULL,
  type VARCHAR(32) NOT NULL DEFAULT 'INCOME',
  amount FLOAT NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'EUR',
  category VARCHAR(64),
  description TEXT,
  transaction_date DATE NOT NULL,
  vendor VARCHAR(255),
  invoice_id VARCHAR(36),
  project_id VARCHAR(36),
  exchange_rate FLOAT,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS transactions_company_idx ON transactions(company_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON transactions(type);

-- 发票表
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(64) NOT NULL UNIQUE,
  company_id VARCHAR(36) NOT NULL,
  client_name VARCHAR(255),
  client_tax_id VARCHAR(64),
  items JSONB,
  subtotal FLOAT NOT NULL DEFAULT 0,
  tax_amount FLOAT NOT NULL DEFAULT 0,
  total_amount FLOAT NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'EUR',
  issue_date DATE NOT NULL,
  due_date DATE,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  notes TEXT,
  paid_date DATE,
  transaction_id VARCHAR(36),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS invoices_number_idx ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices(status);
CREATE INDEX IF NOT EXISTS invoices_company_idx ON invoices(company_id);

-- 汇率表
CREATE TABLE IF NOT EXISTS exchange_rates (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency VARCHAR(8) NOT NULL,
  to_currency VARCHAR(8) NOT NULL,
  rate FLOAT NOT NULL,
  rate_date DATE NOT NULL,
  source VARCHAR(64) NOT NULL DEFAULT 'MANUAL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS exchange_rates_unique_idx ON exchange_rates(rate_date, from_currency, to_currency);

-- 项目表
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 插入默认管理员用户 (密码: admin123)
INSERT INTO users (name, email, password, role, company_access, is_active)
VALUES ('管理员', 'admin@linheim.com', '$2a$10$rQZ9ZvJ7X3K8LmNpQrStUOvWxYzAbCdEfGhIjKlMnOpQrStUv', 'ADMIN', '["*"]', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 插入示例公司数据
INSERT INTO companies (name, code, legal_name, tax_id, currency, country, type, is_active)
VALUES 
  ('Deyou international GmbH', 'DEYOU', 'Deyou international GmbH', 'DE123456789', 'EUR', 'Germany', 'warehouse', TRUE),
  ('Wanling GmbH', 'WANLING', 'Wanling GmbH', 'DE987654321', 'EUR', 'Germany', 'hr', TRUE),
  ('江苏程辉商贸有限公司', 'JSCH', '江苏程辉商贸有限公司', '91320000MA1234567X', 'CNY', 'China', 'billing', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 插入示例汇率数据
INSERT INTO exchange_rates (from_currency, to_currency, rate, rate_date, source)
VALUES 
  ('EUR', 'CNY', 7.85, CURRENT_DATE, 'BANK_OF_CHINA'),
  ('CNY', 'EUR', 0.127, CURRENT_DATE, 'BANK_OF_CHINA'),
  ('USD', 'CNY', 7.25, CURRENT_DATE, 'BANK_OF_CHINA'),
  ('CNY', 'USD', 0.138, CURRENT_DATE, 'BANK_OF_CHINA'),
  ('EUR', 'USD', 1.08, CURRENT_DATE, 'BANK_OF_CHINA'),
  ('USD', 'EUR', 0.926, CURRENT_DATE, 'BANK_OF_CHINA')
ON CONFLICT (rate_date, from_currency, to_currency) DO NOTHING;
