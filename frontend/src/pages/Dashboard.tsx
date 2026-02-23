import { TrendingUp, TrendingDown, DollarSign, CreditCard, ArrowUpRight, ArrowDownRight, Wallet, PieChart, Activity, Sparkles } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* 欢迎横幅 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-white/80 text-sm font-medium">财务概览</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">林海集团财务系统</h1>
          <p className="text-white/70 text-sm md:text-base">实时监控多公司、多币种财务数据</p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="本月收入"
          value="€125,430"
          change="+12.5%"
          positive
          icon={TrendingUp}
          gradient="from-emerald-500 to-teal-500"
          delay={0}
        />
        <StatCard
          title="本月支出"
          value="€87,210"
          change="-5.2%"
          positive={false}
          icon={TrendingDown}
          gradient="from-rose-500 to-pink-500"
          delay={1}
        />
        <StatCard
          title="本月利润"
          value="€38,220"
          change="+18.3%"
          positive
          icon={DollarSign}
          gradient="from-violet-500 to-purple-500"
          delay={2}
        />
        <StatCard
          title="待开票金额"
          value="€15,680"
          change="3 笔待处理"
          icon={CreditCard}
          gradient="from-amber-500 to-orange-500"
          delay={3}
        />
      </div>

      {/* 快速操作 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <QuickAction
          title="新增流水"
          icon={Activity}
          gradient="from-blue-500 to-cyan-500"
        />
        <QuickAction
          title="开具发票"
          icon={CreditCard}
          gradient="from-emerald-500 to-green-500"
        />
        <QuickAction
          title="同步汇率"
          icon={TrendingUp}
          gradient="from-violet-500 to-purple-500"
        />
        <QuickAction
          title="查看报表"
          icon={PieChart}
          gradient="from-orange-500 to-red-500"
        />
      </div>

      {/* Company Overview */}
      <div className="modern-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">各公司财务概况</h3>
            <p className="text-sm text-gray-400 mt-0.5">实时同步各子公司财务数据</p>
          </div>
          <button className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
            查看详情
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          <CompanyCard
            name="Deyou international GmbH"
            income="€95,000"
            expense="€62,000"
            profit="€33,000"
            profitChange="+15.2%"
            color="violet"
            flag="🇩🇪"
          />
          <CompanyCard
            name="Wanling GmbH"
            income="€12,000"
            expense="€8,500"
            profit="€3,500"
            profitChange="+8.5%"
            color="emerald"
            flag="🇩🇪"
          />
          <CompanyCard
            name="江苏程辉商贸有限公司"
            income="¥458,000"
            expense="¥320,000"
            profit="¥138,000"
            profitChange="+22.1%"
            color="blue"
            flag="🇨🇳"
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="modern-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">最近流水</h3>
            <p className="text-sm text-gray-400 mt-0.5">最近3笔交易记录</p>
          </div>
          <a href="/transactions" className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
            查看全部
            <ArrowUpRight className="w-4 h-4" />
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
  gradient,
  delay,
}: {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  icon: any;
  gradient: string;
  delay: number;
}) {
  return (
    <div 
      className="stat-card animate-fade-in-up opacity-0 group"
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`
          w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} 
          flex items-center justify-center shadow-lg
          group-hover:scale-110 transition-transform duration-300
        `}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`
          flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
          ${positive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}
        `}>
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function QuickAction({
  title,
  icon: Icon,
  gradient,
}: {
  title: string;
  icon: any;
  gradient: string;
}) {
  return (
    <button className="glass-card p-4 flex items-center gap-3 hover-lift group cursor-pointer text-left">
      <div className={`
        w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} 
        flex items-center justify-center shadow-lg
        group-hover:scale-110 transition-transform duration-300
      `}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{title}</span>
    </button>
  );
}

function CompanyCard({
  name,
  income,
  expense,
  profit,
  profitChange,
  color,
  flag,
}: {
  name: string;
  income: string;
  expense: string;
  profit: string;
  profitChange: string;
  color: string;
  flag: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    violet: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  };

  const colors = colorMap[color] || colorMap.violet;

  return (
    <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100/50 hover:bg-gray-100/50 transition-colors duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{flag}</span>
          <p className="font-semibold text-gray-900">{name}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
          运营正常
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">收入</p>
          <p className="font-semibold text-gray-700">{income}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">支出</p>
          <p className="font-semibold text-gray-700">{expense}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">利润</p>
          <div className="flex items-center gap-1">
            <p className="font-semibold text-emerald-600">{profit}</p>
            <span className="text-xs text-emerald-500">{profitChange}</span>
          </div>
        </div>
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
  const typeConfig = {
    income: { 
      bg: 'bg-emerald-100', 
      text: 'text-emerald-700', 
      icon: ArrowUpRight,
      label: '收入' 
    },
    expense: { 
      bg: 'bg-rose-100', 
      text: 'text-rose-700', 
      icon: ArrowDownRight,
      label: '支出' 
    },
    transfer: { 
      bg: 'bg-blue-100', 
      text: 'text-blue-700', 
      icon: Activity,
      label: '转账' 
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${config.text}`} />
        </div>
        <div>
          <p className="font-medium text-gray-900">{description}</p>
          <p className="text-sm text-gray-400">{company}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${type === 'expense' ? 'text-rose-600' : type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
          {type === 'expense' ? '-' : ''}{amount}
        </p>
        <p className="text-xs text-gray-400">{date}</p>
      </div>
    </div>
  );
}
