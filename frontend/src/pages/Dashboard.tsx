import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="本月收入"
          value="€125,430"
          change="+12.5%"
          positive
          icon={TrendingUp}
        />
        <StatCard
          title="本月支出"
          value="€87,210"
          change="-5.2%"
          positive={false}
          icon={TrendingDown}
        />
        <StatCard
          title="本月利润"
          value="€38,220"
          change="+18.3%"
          positive
          icon={DollarSign}
        />
        <StatCard
          title="待开票金额"
          value="€15,680"
          change="3 笔"
          icon={CreditCard}
        />
      </div>

      {/* Company Overview */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">各公司财务概况</h3>
        <div className="space-y-4">
          <CompanyCard
            name="Deyou international GmbH"
            income="€95,000"
            expense="€62,000"
            profit="€33,000"
            color="blue"
          />
          <CompanyCard
            name="Wanling GmbH"
            income="€12,000"
            expense="€8,500"
            profit="€3,500"
            color="green"
          />
          <CompanyCard
            name="江苏程辉商贸有限公司"
            income="¥458,000"
            expense="¥320,000"
            profit="¥138,000"
            color="purple"
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">最近流水</h3>
          <a href="/transactions" className="text-sm text-primary-600 hover:text-primary-700">
            查看全部 →
          </a>
        </div>
        <div className="space-y-3">
          <TransactionRow
            type="income"
            description="客户A - 仓储费"
            company="Deyou international GmbH"
            amount="€2,500"
            date="2026-02-21"
          />
          <TransactionRow
            type="expense"
            description="支付给供应商B - 运输费"
            company="Deyou international GmbH"
            amount="€1,850"
            date="2026-02-21"
          />
          <TransactionRow
            type="transfer"
            description="人力资源费结算"
            company="Deyou → Wanling"
            amount="€3,200"
            date="2026-02-20"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
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
        <div className="p-2 bg-gray-50 rounded-lg">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
      </div>
    </div>
  );
}

function CompanyCard({
  name,
  income,
  expense,
  profit,
  color,
}: {
  name: string;
  income: string;
  expense: string;
  profit: string;
  color: string;
}) {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium text-gray-900 text-sm md:text-base">{name}</p>
        <div className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${colorMap[color as keyof typeof colorMap]}`}>
          正常
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs md:text-sm">
        <span className="text-gray-600">收入: <span className="font-medium">{income}</span></span>
        <span className="text-gray-600">支出: <span className="font-medium">{expense}</span></span>
        <span className="text-green-600 font-medium">利润: {profit}</span>
      </div>
    </div>
  );
}

function TransactionRow({
  type,
  description,
  company,
  amount,
  date,
}: {
  type: 'income' | 'expense' | 'transfer';
  description: string;
  company: string;
  amount: string;
  date: string;
}) {
  const typeMap = {
    income: { bg: 'bg-green-100', text: 'text-green-700', label: '收入' },
    expense: { bg: 'bg-red-100', text: 'text-red-700', label: '支出' },
    transfer: { bg: 'bg-blue-100', text: 'text-blue-700', label: '转账' },
  };

  const typeInfo = typeMap[type];

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
          <div className={`px-2 py-1 rounded text-xs font-medium ${typeInfo.bg} ${typeInfo.text} flex-shrink-0`}>
            {typeInfo.label}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 text-sm md:text-base truncate">{description}</p>
            <p className="text-xs md:text-sm text-gray-500 truncate">{company}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`font-semibold text-sm md:text-base ${
            type === 'income' ? 'text-green-600' : type === 'expense' ? 'text-red-600' : 'text-blue-600'
          }`}>
            {amount}
          </p>
          <p className="text-xs text-gray-500">{date}</p>
        </div>
      </div>
    </div>
  );
}
        <p className={`font-semibold ${type === 'income' ? 'text-green-600' : type === 'expense' ? 'text-red-600' : 'text-gray-900'}`}>
          {type === 'expense' ? '-' : ''}{amount}
        </p>
        <p className="text-sm text-gray-500">{date}</p>
      </div>
    </div>
  );
}
