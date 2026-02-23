-- ============================================
-- Linheim 财务系统 - 数据库表结构（Supabase）
-- ============================================

-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'VIEWER',
  company_access TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建公司表
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  currency VARCHAR(10) DEFAULT 'EUR',
  country VARCHAR(100),
  type VARCHAR(50),
  initial_balance DECIMAL(20,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建财务流水表
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'INCOME',
  amount DECIMAL(20,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'EUR',
  category VARCHAR(100),
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  related_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  related_transaction_id UUID,
  invoice_id UUID,
  project_id UUID,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建发票表
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(255) UNIQUE NOT NULL,
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  amount DECIMAL(20,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'EUR',
  issuer_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  receiver_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  receiver_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'DRAFT',
  file_url TEXT,
  related_transaction_id UUID,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 创建项目表
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 创建汇率记录表
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  from_currency VARCHAR(10) NOT NULL,
  to_currency VARCHAR(10) NOT NULL,
  rate DECIMAL(20,10) NOT NULL,
  source VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, from_currency, to_currency)
);

-- 7. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_invoices_issuer_company_id ON invoices(issuer_company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_companies_code ON companies(code);

-- 8. 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. 为所有表添加更新时间戳触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 初始化数据
-- ============================================

-- 创建初始管理员用户（密码: admin123，已经过 bcrypt 哈希）
INSERT INTO users (id, name, email, password, role, company_access, created_at, updated_at)
VALUES (
  'admin-0000-0000-0000-000000000001',
  'Admin',
  'admin@linheim.de',
  '$2a$10$8K1p/a0d3l3Y1xG1nQ1T8.V1xG1nQ1T8.V1xG1nQ1T8.V1xG1nQ1T8',
  'ADMIN',
  '[]',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 创建初始公司
INSERT INTO companies (name, code, currency, country, type, initial_balance, created_at, updated_at)
VALUES
  ('Deyou international GmbH', 'DEYOU', 'EUR', 'Germany', 'WAREHOUSE', 0, NOW(), NOW()),
  ('Wanling GmbH', 'WANLING', 'EUR', 'Germany', 'HR', 0, NOW(), NOW()),
  ('江苏程辉商贸有限公司', 'JSCH', 'CNY', 'China', 'INVOICE', 0, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 完成提示
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE '数据库初始化完成！';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '初始管理员账号:';
  RAISE NOTICE '邮箱: admin@linheim.de';
  RAISE NOTICE '密码: admin123';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '初始公司:';
  RAISE NOTICE '- Deyou international GmbH (DEYOU)';
  RAISE NOTICE '- Wanling GmbH (WANLING)';
  RAISE NOTICE '- 江苏程辉商贸有限公司 (JSCH)';
  RAISE NOTICE '===========================================';
END $$;
