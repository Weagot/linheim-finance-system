import { Download, Calendar, BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">报表中心</h1>
          <p className="text-sm text-gray-500 mt-1">查看财务报表和数据分析</p>
        </div>
        <div className="flex gap-3">
          <select className="input-field w-[150px]">
            <option value="">选择公司</option>
            <option value="all">全部公司</option>
            <option value="deyou">Deyou international GmbH</option>
            <option value="wanling">Wanling GmbH</option>
            <option value="jscheng">江苏程辉商贸有限公司</option>
          </select>
          <select className="input-field w-[150px]">
            <option value="month">本月</option>
            <option value="quarter">本季度</option>
            <option value="year">本年</option>
            <option value="custom">自定义</option>
          </select>
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ReportCard
          title="总收入"
          value="€125,430"
          change="+12.5%"
          positive
          icon={TrendingUp}
        />
        <ReportCard
          title="总支出"
          value="€87,210"
          change="-5.2%"
          positive
          icon={TrendingDown}
        />
        <ReportCard
          title="净利润"
          value="€38,220"
          change="+18.3%"
          positive
          icon={DollarSign}
        />
        <ReportCard
          title="净利率"
          value="30.5%"
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
            <ProfitRow label="收入" amount="€125,430" indent={0} />
            <ProfitRow label="成本" amount="€87,210" indent={1} negative />
            <ProfitRow label="净利润" amount="€38,220" indent={0} bold total />
          </div>
        </ReportSection>

        {/* Cash Flow */}
        <ReportSection
          title="现金流"
          icon={DollarSign}
        >
          <div className="space-y-3">
            <CashFlowRow label="期初现金" amount="€120,000" type="opening" />
            <CashFlowRow label="流入" amount="€125,430" type="inflow" />
            <CashFlowRow label="流出" amount="€87,210" type="outflow" />
            <CashFlowRow label="期末现金" amount="€158,220" type="closing" total />
          </div>
        </ReportSection>

        {/* Company Breakdown */}
        <ReportSection
          title="各公司营收"
          icon={BarChart3}
        >
          <div className="space-y-4">
            <CompanyBar
              name="Deyou international GmbH"
              value={95000}
              total={125430}
              color="blue"
            />
            <CompanyBar
              name="Wanling GmbH"
              value={12000}
              total={125430}
              color="green"
            />
            <CompanyBar
              name="江苏程辉商贸有限公司"
              value={18430}
              total={125430}
              color="purple"
            />
          </div>
        </ReportSection>

        {/* Expense Breakdown */}
        <ReportSection
          title="支出构成"
          icon={TrendingDown}
        >
          <div className="space-y-4">
            <ExpenseBar name="运输" value={35000} total={87210} color="blue" />
            <ExpenseBar name="仓储" value={28000} total={87210} color="green" />
            <ExpenseBar name="人工" value={15210} total={87210} color="yellow" />
            <ExpenseBar name="其他" value={9000} total={87210} color="gray" />
          </div>
        </ReportSection>
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
        <div className="p-2 bg-primary-50 rounded-lg">
          <Icon className="w-5 h-5 text-primary-600" />
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
        <Icon className="w-5 h-5 text-primary-600" />
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
      } ${total ? 'border-t border-gray-200 mt-2' : ''}`}
      style={{ paddingLeft: `${(indent || 0) * 24}px` }}
    >
      <span className={negative ? 'text-gray-600' : 'text-gray-900'}>{label}</span>
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
    opening: 'text-gray-600',
    inflow: 'text-green-600',
    outflow: 'text-red-600',
    closing: 'font-bold text-gray-900',
  };

  return (
    <div
      className={`flex items-center justify-between py-2 ${
        total ? 'border-t border-gray-200 mt-2' : ''
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
}: {
  name: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = (value / total * 100).toFixed(1);
  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-900">{name}</span>
        <span className="text-sm font-medium text-gray-900">€{value.toLocaleString()} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorMap[color as keyof typeof colorMap]} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
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
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    gray: 'bg-gray-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-900">{name}</span>
        <span className="text-sm font-medium text-gray-900">€{value.toLocaleString()} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorMap[color as keyof typeof colorMap]} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
