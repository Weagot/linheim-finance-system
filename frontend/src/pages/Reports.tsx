import { useState } from 'react';
import { Download, BarChart3, TrendingUp, TrendingDown, DollarSign, Building2, FileSpreadsheet, FileText, Receipt } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { exportToExcel, exportFullReport, formatCurrency, formatDate } from '../lib/excel';

// Mock data for reports
const profitLossData = {
  income: {
    total: 125430,
    breakdown: [
      { category: '仓储服务', amount: 75000 },
      { category: '运输服务', amount: 32000 },
      { category: '其他收入', amount: 18430 },
    ],
  },
  expenses: {
    total: 87210,
    breakdown: [
      { category: '运输', amount: 35000 },
      { category: '仓储', amount: 28000 },
      { category: '人工', amount: 15210 },
      { category: '其他', amount: 9000 },
    ],
  },
  profit: 38220,
};

const cashFlowData = {
  opening: 120000,
  inflow: 125430,
  outflow: 87210,
  closing: 158220,
};

const companyData = [
  {
    id: '1',
    name: 'Deyou international GmbH',
    code: 'DEYOU',
    currency: 'EUR',
    income: 95000,
    expenses: 68000,
    profit: 27000,
    percentage: 75.7,
    initialBalance: 100000,
  },
  {
    id: '2',
    name: 'Wanling GmbH',
    code: 'WANLING',
    currency: 'EUR',
    income: 12000,
    expenses: 15210,
    profit: -3210,
    percentage: 9.6,
    initialBalance: 50000,
  },
  {
    id: '3',
    name: '江苏程辉商贸有限公司',
    code: 'JSCHENG',
    currency: 'CNY',
    income: 18430,
    expenses: 4000,
    profit: 14430,
    percentage: 14.7,
    initialBalance: 200000,
  },
];

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const toast = useToast();

  // Export functions
  const handleExportFullReport = () => {
    // Prepare data for full report
    const transactions = [
      { date: '2026-02-21', company: 'Deyou international GmbH', type: '收入', amount: 2500, currency: 'EUR', category: '仓储费', description: '客户A - 仓储费' },
      { date: '2026-02-21', company: 'Deyou international GmbH', type: '支出', amount: 1850, currency: 'EUR', category: '运输费', description: '支付给供应商B' },
      { date: '2026-02-20', company: 'Deyou international GmbH', type: '转账', amount: 3200, currency: 'EUR', category: '人力资源', description: '人力资源费结算' },
    ];
    
    const invoices = [
      { invoiceNumber: 'INV-2026-001', invoiceDate: '2026-02-20', amount: 5000, currency: 'EUR', issuerCompany: 'Deyou international GmbH', status: '已开票' },
    ];
    
    const summary = companyData.map(c => ({
      name: c.name,
      income: c.income,
      expenses: c.expenses,
      profit: c.profit,
    }));
    
    exportFullReport(transactions, invoices, summary);
    toast.show('完整报表已导出', 'success');
    setShowExportMenu(false);
  };

  const handleExportProfitLoss = () => {
    const data = [
      { '类别': '总收入', '金额': profitLossData.income.total, '币种': 'EUR' },
      ...profitLossData.income.breakdown.map(item => ({ '类别': `  ${item.category}`, '金额': item.amount, '币种': 'EUR' })),
      { '类别': '总支出', '金额': -profitLossData.expenses.total, '币种': 'EUR' },
      ...profitLossData.expenses.breakdown.map(item => ({ '类别': `  ${item.category}`, '金额': -item.amount, '币种': 'EUR' })),
      { '类别': '净利润', '金额': profitLossData.profit, '币种': 'EUR' },
    ];
    exportToExcel(data, `利润表_${formatDate(new Date())}`, '利润表');
    toast.show('利润表已导出', 'success');
    setShowExportMenu(false);
  };

  const handleExportCashFlow = () => {
    const data = [
      { '项目': '期初现金', '金额': cashFlowData.opening, '币种': 'EUR' },
      { '项目': '现金流入', '金额': cashFlowData.inflow, '币种': 'EUR' },
      { '项目': '现金流出', '金额': -cashFlowData.outflow, '币种': 'EUR' },
      { '项目': '净现金流', '金额': cashFlowData.inflow - cashFlowData.outflow, '币种': 'EUR' },
      { '项目': '期末现金', '金额': cashFlowData.closing, '币种': 'EUR' },
    ];
    exportToExcel(data, `现金流表_${formatDate(new Date())}`, '现金流');
    toast.show('现金流表已导出', 'success');
    setShowExportMenu(false);
  };

  const handleExportCompanySummary = () => {
    const data = companyData.map(c => ({
      '公司名称': c.name,
      '公司代码': c.code,
      '币种': c.currency,
      '收入': c.income,
      '支出': c.expenses,
      '利润': c.profit,
      '占比': `${c.percentage}%`,
    }));
    exportToExcel(data, `公司财务汇总_${formatDate(new Date())}`, '公司汇总');
    toast.show('公司汇总已导出', 'success');
    setShowExportMenu(false);
  };

  const profitMargin = (profitLossData.profit / profitLossData.income.total * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">报表中心</h1>
          <p className="text-sm text-gray-500 mt-1">查看财务报表和数据分析</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field w-[150px]"
          >
            <option value="month">本月</option>
            <option value="quarter">本季度</option>
            <option value="year">本年</option>
            <option value="custom">自定义</option>
          </select>
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              导出报表
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={handleExportFullReport}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  <span>完整报表</span>
                </button>
                <button
                  onClick={handleExportProfitLoss}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>利润表</span>
                </button>
                <button
                  onClick={handleExportCashFlow}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  <span>现金流表</span>
                </button>
                <button
                  onClick={handleExportCompanySummary}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-orange-600" />
                  <span>公司汇总</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ReportCard
          title="总收入"
          value={`€${profitLossData.income.total.toLocaleString()}`}
          change="+12.5%"
          positive
          icon={TrendingUp}
        />
        <ReportCard
          title="总支出"
          value={`€${profitLossData.expenses.total.toLocaleString()}`}
          change="-5.2%"
          positive
          icon={TrendingDown}
        />
        <ReportCard
          title="净利润"
          value={`€${profitLossData.profit.toLocaleString()}`}
          change="+18.3%"
          positive
          icon={DollarSign}
        />
        <ReportCard
          title="净利率"
          value={`${profitMargin}%`}
          change="+2.1%"
          positive
          icon={BarChart3}
        />
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit & Loss */}
        <ReportSection
          title="利润表"
          icon={TrendingUp}
        >
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-900">总收入</span>
                <span className="font-bold text-blue-900">
                  €{profitLossData.income.total.toLocaleString()}
                </span>
              </div>
            </div>

            {profitLossData.income.breakdown.map((item, index) => (
              <ProfitRow
                key={index}
                label={item.category}
                amount={`€${item.amount.toLocaleString()}`}
                indent={1}
              />
            ))}

            <div className="pt-2 border-t border-gray-200">
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-red-900">总支出</span>
                  <span className="font-bold text-red-900">
                    -€{profitLossData.expenses.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {profitLossData.expenses.breakdown.map((item, index) => (
              <ProfitRow
                key={index}
                label={item.category}
                amount={`€${item.amount.toLocaleString()}`}
                indent={1}
                negative
              />
            ))}

            <div className="pt-2 mt-2 border-t-2 border-gray-300">
              <ProfitRow
                label="净利润"
                amount={`€${profitLossData.profit.toLocaleString()}`}
                indent={0}
                bold
                total
              />
            </div>
          </div>
        </ReportSection>

        {/* Cash Flow */}
        <ReportSection
          title="现金流"
          icon={DollarSign}
        >
          <div className="space-y-3">
            <CashFlowRow
              label="期初现金"
              amount={`€${cashFlowData.opening.toLocaleString()}`}
              type="opening"
            />
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-green-900">流入</span>
                <span className="font-bold text-green-900">
                  +€{cashFlowData.inflow.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-red-900">流出</span>
                <span className="font-bold text-red-900">
                  -€{cashFlowData.outflow.toLocaleString()}
                </span>
              </div>
            </div>
            <CashFlowRow
              label="净现金流"
              amount={`€${(cashFlowData.inflow - cashFlowData.outflow).toLocaleString()}`}
              type={cashFlowData.inflow - cashFlowData.outflow >= 0 ? 'inflow' : 'outflow'}
            />
            <div className="pt-2 mt-2 border-t-2 border-gray-300">
              <CashFlowRow
                label="期末现金"
                amount={`€${cashFlowData.closing.toLocaleString()}`}
                type="closing"
                total
              />
            </div>
          </div>
        </ReportSection>

        {/* Company Breakdown */}
        <ReportSection
          title="各公司营收"
          icon={Building2}
        >
          <div className="space-y-4">
            {companyData.map((company) => (
              <CompanyBar
                key={company.id}
                name={company.name}
                value={company.income}
                total={profitLossData.income.total}
                color="blue"
                profit={company.profit}
                currency={company.currency}
              />
            ))}
          </div>
        </ReportSection>

        {/* Expense Breakdown */}
        <ReportSection
          title="支出构成"
          icon={TrendingDown}
        >
          <div className="space-y-4">
            {profitLossData.expenses.breakdown.map((item, index) => (
              <ExpenseBar
                key={index}
                name={item.category}
                value={item.amount}
                total={profitLossData.expenses.total}
                color={index === 0 ? 'blue' : index === 1 ? 'green' : index === 2 ? 'yellow' : 'gray'}
              />
            ))}
          </div>
        </ReportSection>
      </div>

      {/* Summary Table */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">各公司财务汇总</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">公司</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">收入</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">支出</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">净利润</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">初始余额</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">当前余额</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">占比</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {companyData.map((company) => {
                const currentBalance = company.initialBalance + company.profit;
                return (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                          {company.code}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{company.name}</p>
                          <p className="text-xs text-gray-500">{company.currency}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-green-600">
                      {company.currency === 'CNY' ? '¥' : '€'}
                      {company.income.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-red-600">
                      -{company.currency === 'CNY' ? '¥' : '€'}
                      {company.expenses.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${
                      company.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {company.currency === 'CNY' ? '¥' : '€'}
                      {Math.abs(company.profit).toLocaleString()}
                      {company.profit < 0 ? ' (亏损)' : ''}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {company.currency === 'CNY' ? '¥' : '€'}
                      {company.initialBalance.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${
                      currentBalance >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {company.currency === 'CNY' ? '¥' : '€'}
                      {currentBalance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {company.percentage}%
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-4 text-gray-900">合计</td>
                <td className="px-6 py-4 text-right text-green-600">
                  €{profitLossData.income.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-red-600">
                  -€{profitLossData.expenses.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-green-600">
                  €{profitLossData.profit.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-gray-600">
                  €{companyData.reduce((sum, c) => sum + c.initialBalance, 0).toLocaleString()}
                </td>
                <td className={`px-6 py-4 text-right ${
                  companyData.reduce((sum, c) => sum + c.initialBalance + c.profit, 0) >= 0
                    ? 'text-blue-600'
                    : 'text-red-600'
                }`}>
                  €{companyData.reduce((sum, c) => sum + c.initialBalance + c.profit, 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-gray-600">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportCard({
  title,
  value,
  change,
  positive,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  icon: any;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm mt-1 ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </p>
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function ReportSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ProfitRow({
  label,
  amount,
  indent,
  negative,
  bold,
  total,
}: {
  label: string;
  amount: string;
  indent?: number;
  negative?: boolean;
  bold?: boolean;
  total?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2 ${
        bold ? 'font-bold' : ''
      } ${total ? 'border-t-2 border-gray-300 mt-2 pt-2' : ''}`}
      style={{ paddingLeft: `${(indent || 0) * 24}px` }}
    >
      <span className={negative ? 'text-red-700' : 'text-gray-700'}>{label}</span>
      <span className={`font-semibold ${negative ? 'text-red-600' : 'text-gray-900'}`}>
        {negative ? '-' : ''}{amount}
      </span>
    </div>
  );
}

function CashFlowRow({
  label,
  amount,
  type,
  total,
}: {
  label: string;
  amount: string;
  type: 'opening' | 'inflow' | 'outflow' | 'closing';
  total?: boolean;
}) {
  const typeStyles = {
    opening: 'text-gray-700',
    inflow: 'text-green-600',
    outflow: 'text-red-600',
    closing: 'font-bold text-gray-900',
  };

  return (
    <div
      className={`flex items-center justify-between py-2 ${
        total ? 'border-t-2 border-gray-300 mt-2 pt-2' : ''
      }`}
    >
      <span className="text-gray-900">{label}</span>
      <span className={`font-semibold ${typeStyles[type]}`}>
        {type === 'outflow' ? '-' : ''}{amount}
      </span>
    </div>
  );
}

function CompanyBar({
  name,
  value,
  total,
  color,
  profit,
  currency,
}: {
  name: string;
  value: number;
  total: number;
  color: string;
  profit: number;
  currency: string;
}) {
  const percentage = (value / total * 100).toFixed(1);
  const colorMap = {
    blue: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    green: 'bg-gradient-to-r from-green-500 to-emerald-500',
    purple: 'bg-gradient-to-r from-purple-500 to-pink-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-900 font-medium">{name}</span>
        <span className="text-sm font-medium text-gray-900">
          {currency === 'CNY' ? '¥' : '€'}{value.toLocaleString()} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${colorMap[color as keyof typeof colorMap]} h-2.5 rounded-full transition-all shadow-sm`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-500">
          {currency === 'CNY' ? '¥' : '€'}{(value - 30000).toLocaleString()} 支出
        </span>
        <span className={`text-xs font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {currency === 'CNY' ? '¥' : '€'}{Math.abs(profit).toLocaleString()} 净利润
        </span>
      </div>
    </div>
  );
}

function ExpenseBar({
  name,
  value,
  total,
  color,
}: {
  name: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = (value / total * 100).toFixed(1);
  const colorMap = {
    blue: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    green: 'bg-gradient-to-r from-green-500 to-emerald-500',
    yellow: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    gray: 'bg-gradient-to-r from-gray-500 to-gray-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-900 font-medium">{name}</span>
        <span className="text-sm font-medium text-gray-900">
          €{value.toLocaleString()} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${colorMap[color as keyof typeof colorMap]} h-2.5 rounded-full transition-all shadow-sm`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
