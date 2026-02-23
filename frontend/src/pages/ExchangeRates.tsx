import { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertCircle,
  Calendar,
  ArrowRight,
  Download,
  History
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { exportToExcel, formatDate } from '../lib/excel';

interface ExchangeRate {
  id: string;
  date: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: string;
  change?: number;
  changePercent?: number;
}

interface RateDisplay {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdate: string;
}

// Mock data for development
const mockRates: ExchangeRate[] = [
  { id: '1', date: '2026-02-23', fromCurrency: 'EUR', toCurrency: 'CNY', rate: 7.82, source: '中国银行', change: 0.05, changePercent: 0.64 },
  { id: '2', date: '2026-02-23', fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.08, source: '中国银行', change: -0.02, changePercent: -1.82 },
  { id: '3', date: '2026-02-23', fromCurrency: 'USD', toCurrency: 'CNY', rate: 7.24, source: '中国银行', change: 0.03, changePercent: 0.42 },
  { id: '4', date: '2026-02-23', fromCurrency: 'GBP', toCurrency: 'CNY', rate: 9.12, source: '中国银行', change: 0.08, changePercent: 0.88 },
  { id: '5', date: '2026-02-23', fromCurrency: 'GBP', toCurrency: 'EUR', rate: 1.17, source: '中国银行', change: -0.01, changePercent: -0.85 },
  { id: '6', date: '2026-02-23', fromCurrency: 'HKD', toCurrency: 'CNY', rate: 0.93, source: '中国银行', change: 0.01, changePercent: 1.08 },
];

const mockHistory: ExchangeRate[] = [
  { id: 'h1', date: '2026-02-22', fromCurrency: 'EUR', toCurrency: 'CNY', rate: 7.77, source: '中国银行' },
  { id: 'h2', date: '2026-02-21', fromCurrency: 'EUR', toCurrency: 'CNY', rate: 7.75, source: '中国银行' },
  { id: 'h3', date: '2026-02-20', fromCurrency: 'EUR', toCurrency: 'CNY', rate: 7.72, source: '中国银行' },
  { id: 'h4', date: '2026-02-19', fromCurrency: 'EUR', toCurrency: 'CNY', rate: 7.70, source: '中国银行' },
  { id: 'h5', date: '2026-02-18', fromCurrency: 'EUR', toCurrency: 'CNY', rate: 7.68, source: '中国银行' },
];

const currencyLabels: Record<string, string> = {
  EUR: '欧元',
  CNY: '人民币',
  USD: '美元',
  GBP: '英镑',
  HKD: '港币',
};

const currencySymbols: Record<string, string> = {
  EUR: '€',
  CNY: '¥',
  USD: '$',
  GBP: '£',
  HKD: 'HK$',
};

export default function ExchangeRates() {
  const [rates, setRates] = useState<ExchangeRate[]>(mockRates);
  const [history, setHistory] = useState<ExchangeRate[]>(mockHistory);
  const [selectedPair, setSelectedPair] = useState<string>('EUR-CNY');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('2026-02-23 18:00:00');
  const [showHistory, setShowHistory] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(false);
  
  const toast = useToast();

  // Simulate fetching latest rates
  const fetchLatestRates = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate rate fluctuation
    const updatedRates = rates.map(rate => ({
      ...rate,
      rate: Number((rate.rate + (Math.random() - 0.5) * 0.1).toFixed(4)),
      change: Number((Math.random() - 0.5) * 0.1).toFixed(4),
      changePercent: Number((Math.random() - 0.5) * 2).toFixed(2),
    }));
    
    setRates(updatedRates);
    setLastUpdate(new Date().toLocaleString('zh-CN'));
    setIsLoading(false);
    toast.show('汇率已更新', 'success');
  };

  // Export exchange rates to Excel
  const handleExportRates = () => {
    const data = rates.map(r => ({
      '日期': r.date,
      '货币对': `${r.fromCurrency}/${r.toCurrency}`,
      '汇率': r.rate,
      '涨跌': r.change && r.change > 0 ? `+${r.change}` : r.change || '0',
      '涨跌幅': r.changePercent ? `${r.changePercent}%` : '-',
      '数据来源': r.source,
    }));
    exportToExcel(data, `汇率记录_${formatDate(new Date())}`, '汇率');
    toast.show('汇率已导出为 Excel', 'success');
  };

  // Export history to Excel
  const handleExportHistory = () => {
    const data = history.map(r => ({
      '日期': r.date,
      '货币对': `${r.fromCurrency}/${r.toCurrency}`,
      '汇率': r.rate,
      '数据来源': r.source,
    }));
    exportToExcel(data, `汇率历史_${formatDate(new Date())}`, '汇率历史');
    toast.show('汇率历史已导出为 Excel', 'success');
  };

  // Auto update every 5 minutes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoUpdate) {
      interval = setInterval(fetchLatestRates, 5 * 60 * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoUpdate]);

  const getRateDisplay = (from: string, to: string): RateDisplay | undefined => {
    const rate = rates.find(r => r.fromCurrency === from && r.toCurrency === to);
    if (!rate) return undefined;
    
    const change = rate.change || 0;
    const changePercent = rate.changePercent || 0;
    
    return {
      pair: `${from}/${to}`,
      rate: rate.rate,
      change,
      changePercent,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      lastUpdate: rate.date,
    };
  };

  const mainPairs = [
    getRateDisplay('EUR', 'CNY'),
    getRateDisplay('EUR', 'USD'),
    getRateDisplay('USD', 'CNY'),
    getRateDisplay('GBP', 'CNY'),
    getRateDisplay('GBP', 'EUR'),
    getRateDisplay('HKD', 'CNY'),
  ].filter(Boolean) as RateDisplay[];

  const convertAmount = (amount: number, from: string, to: string): number => {
    if (from === to) return amount;
    const rate = rates.find(r => r.fromCurrency === from && r.toCurrency === to);
    if (rate) return amount * rate.rate;
    // Try inverse
    const inverseRate = rates.find(r => r.fromCurrency === to && r.toCurrency === from);
    if (inverseRate) return amount / inverseRate.rate;
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">汇率管理</h1>
          <p className="text-sm text-gray-500 mt-1">实时汇率查询与历史记录</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>最后更新: {lastUpdate}</span>
          </div>
          <button
            onClick={fetchLatestRates}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? '更新中...' : '更新汇率'}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">EUR/CNY</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {getRateDisplay('EUR', 'CNY')?.rate.toFixed(4)}
              </p>
              <p className={`text-sm mt-1 ${getRateDisplay('EUR', 'CNY')?.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {getRateDisplay('EUR', 'CNY')?.trend === 'up' ? '+' : ''}{getRateDisplay('EUR', 'CNY')?.changePercent}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-blue-600 font-bold">€/¥</span>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">EUR/USD</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {getRateDisplay('EUR', 'USD')?.rate.toFixed(4)}
              </p>
              <p className={`text-sm mt-1 ${getRateDisplay('EUR', 'USD')?.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {getRateDisplay('EUR', 'USD')?.trend === 'up' ? '+' : ''}{getRateDisplay('EUR', 'USD')?.changePercent}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-green-600 font-bold">€/$</span>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">USD/CNY</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {getRateDisplay('USD', 'CNY')?.rate.toFixed(4)}
              </p>
              <p className={`text-sm mt-1 ${getRateDisplay('USD', 'CNY')?.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {getRateDisplay('USD', 'CNY')?.trend === 'up' ? '+' : ''}{getRateDisplay('USD', 'CNY')?.changePercent}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-purple-600 font-bold">$/¥</span>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">自动更新</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {autoUpdate ? '已开启' : '已关闭'}
              </p>
              <p className="text-sm text-gray-500 mt-1">每5分钟自动刷新</p>
            </div>
            <button
              onClick={() => setAutoUpdate(!autoUpdate)}
              className={`w-14 h-8 rounded-full transition-colors ${
                autoUpdate ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                autoUpdate ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Rate Cards Grid */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">实时汇率</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertCircle className="w-4 h-4" />
            <span>数据来源: 中国银行</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mainPairs.map((rate) => (
            <div 
              key={rate.pair} 
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                selectedPair === rate.pair ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-gray-50'
              }`}
              onClick={() => setSelectedPair(rate.pair)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900">{rate.pair}</span>
                <div className={`flex items-center gap-1 ${
                  rate.trend === 'up' ? 'text-green-600' : rate.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {rate.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : rate.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : null}
                  <span className="text-sm font-medium">
                    {rate.trend === 'up' ? '+' : ''}{rate.changePercent}%
                  </span>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {rate.rate.toFixed(4)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {currencyLabels[rate.pair.split('/')[0]]} → {currencyLabels[rate.pair.split('/')[1]]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Currency Converter */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">汇率换算器</h3>
        <CurrencyConverter rates={rates} />
      </div>

      {/* History Table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">历史汇率记录</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <History className="w-4 h-4" />
              {showHistory ? '隐藏历史' : '查看历史'}
            </button>
            <button 
              onClick={handleExportHistory}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              导出记录
            </button>
          </div>
        </div>
        
        {showHistory && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">日期</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">货币对</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">汇率</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">数据来源</th>
                </tr>
              </thead>
              <tbody>
                {mockHistory.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {record.date}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {record.fromCurrency}/{record.toCurrency}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {record.rate.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {record.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Currency Converter Component
function CurrencyConverter({ rates }: { rates: ExchangeRate[] }) {
  const [amount, setAmount] = useState<string>('1000');
  const [fromCurrency, setFromCurrency] = useState<string>('EUR');
  const [toCurrency, setToCurrency] = useState<string>('CNY');
  
  const getRate = (from: string, to: string): number => {
    if (from === to) return 1;
    const rate = rates.find(r => r.fromCurrency === from && r.toCurrency === to);
    if (rate) return rate.rate;
    const inverseRate = rates.find(r => r.fromCurrency === to && r.toCurrency === from);
    if (inverseRate) return 1 / inverseRate.rate;
    return 1;
  };
  
  const convertedAmount = Number(amount) * getRate(fromCurrency, toCurrency);
  const currentRate = getRate(fromCurrency, toCurrency);
  
  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };
  
  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      {/* From Currency */}
      <div className="flex-1 w-full">
        <label className="block text-sm font-medium text-gray-500 mb-2">金额</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field flex-1"
            placeholder="输入金额"
          />
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="input-field w-32"
          >
            {Object.keys(currencyLabels).map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Swap Button */}
      <button
        onClick={swapCurrencies}
        className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors mt-6"
      >
        <ArrowRight className="w-5 h-5 text-gray-600 rotate-90 md:rotate-0" />
      </button>
      
      {/* To Currency */}
      <div className="flex-1 w-full">
        <label className="block text-sm font-medium text-gray-500 mb-2">转换结果</label>
        <div className="flex gap-2">
          <div className="input-field flex-1 bg-gray-50 flex items-center font-mono text-lg font-semibold">
            {convertedAmount.toFixed(2)}
          </div>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="input-field w-32"
          >
            {Object.keys(currencyLabels).map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Rate Info */}
      <div className="mt-4 md:mt-6 text-sm text-gray-500">
        当前汇率: 1 {fromCurrency} = {currentRate.toFixed(4)} {toCurrency}
      </div>
    </div>
  );
}
