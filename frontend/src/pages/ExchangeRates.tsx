import { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Download,
  Building2,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Database,
  Globe
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { exportToExcel, formatDate } from '../lib/excel';
import { exchangeRatesApi } from '../lib/api';

interface ExchangeRate {
  id: string;
  rate_date: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  source: string;
}

interface BocRate {
  currency: string;
  currencyName: string;
  sellingRate: number;
  date: string;
  buyingRate?: number;
  cashBuyingRate?: number;
  cashSellingRate?: number;
  middleRate?: number;
}

const currencyInfo: Record<string, { name: string; flag: string; color: string }> = {
  EUR: { name: '欧元', flag: '🇪🇺', color: 'from-blue-500 to-indigo-500' },
  CNY: { name: '人民币', flag: '🇨🇳', color: 'from-red-500 to-rose-500' },
  USD: { name: '美元', flag: '🇺🇸', color: 'from-emerald-500 to-teal-500' },
  GBP: { name: '英镑', flag: '🇬🇧', color: 'from-purple-500 to-violet-500' },
  HKD: { name: '港币', flag: '🇭🇰', color: 'from-orange-500 to-amber-500' },
  JPY: { name: '日元', flag: '🇯🇵', color: 'from-pink-500 to-rose-500' },
  AUD: { name: '澳元', flag: '🇦🇺', color: 'from-cyan-500 to-blue-500' },
  CAD: { name: '加元', flag: '🇨🇦', color: 'from-lime-500 to-green-500' },
  CHF: { name: '瑞士法郎', flag: '🇨🇭', color: 'from-red-600 to-red-500' },
};

export default function ExchangeRates() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [bocPreview, setBocPreview] = useState<BocRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  
  const toast = useToast();

  // 获取已存储的汇率
  const fetchRates = async () => {
    setIsLoading(true);
    try {
      const data = await exchangeRatesApi.getAll();
      setRates(data || []);
      if (data && data.length > 0) {
        setLastUpdate(data[0].rate_date);
      }
    } catch (error) {
      console.error('Failed to fetch rates:', error);
      toast.show('获取汇率失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 预览中国银行汇率
  const previewBocRates = async () => {
    setIsLoading(true);
    try {
      const data = await exchangeRatesApi.preview();
      if (data.success) {
        setBocPreview(data.rates || []);
        setShowPreview(true);
        setLastUpdate(data.date);
      }
    } catch (error) {
      console.error('Failed to preview rates:', error);
      toast.show('获取中国银行汇率失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 同步中国银行汇率
  const syncBocRates = async () => {
    setIsSyncing(true);
    try {
      const data = await exchangeRatesApi.sync();
      if (data.success) {
        toast.show(`成功同步 ${data.count} 条汇率数据`, 'success');
        setShowPreview(false);
        fetchRates();
      } else {
        toast.show(data.message || '同步失败', 'error');
      }
    } catch (error) {
      console.error('Failed to sync rates:', error);
      toast.show('同步汇率失败', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // 导出汇率
  const handleExportRates = () => {
    if (rates.length === 0) {
      toast.show('没有可导出的数据', 'error');
      return;
    }
    const data = rates.map(r => ({
      '日期': r.rate_date,
      '源币种': r.from_currency,
      '目标币种': r.to_currency,
      '汇率': r.rate,
      '数据来源': r.source,
    }));
    exportToExcel(data, `汇率记录_${formatDate(new Date())}`, '汇率');
    toast.show('汇率已导出为 Excel', 'success');
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // 获取指定货币对的汇率
  const getRate = (from: string, to: string): ExchangeRate | undefined => {
    return rates.find(r => r.from_currency === from && r.to_currency === to);
  };

  // 主要货币对
  const mainPairs = [
    { from: 'EUR', to: 'CNY', trend: 'up' },
    { from: 'USD', to: 'CNY', trend: 'down' },
    { from: 'GBP', to: 'CNY', trend: 'up' },
    { from: 'EUR', to: 'USD', trend: 'stable' },
    { from: 'HKD', to: 'CNY', trend: 'stable' },
    { from: 'USD', to: 'EUR', trend: 'up' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">汇率管理</h1>
          </div>
          <p className="text-sm text-gray-500">
            数据来源：中国银行现汇卖出价（用于客户结算）
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100/50 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{lastUpdate}</span>
            </div>
          )}
          <button
            onClick={handleExportRates}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            导出
          </button>
          <button
            onClick={previewBocRates}
            disabled={isLoading}
            className="btn-gradient flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            {isLoading ? '获取中...' : '同步汇率'}
          </button>
        </div>
      </div>

      {/* 信息提示 */}
      <div className="glass-card p-4 border-l-4 border-l-violet-500">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900 mb-1">汇率说明</p>
            <ul className="space-y-1 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                <strong>现汇卖出价</strong>：客户从银行购买外汇的价格，用于结算
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                汇率自动关联到开票日期，确保结算准确
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                建议每日同步一次最新汇率
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 主要汇率卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mainPairs.map(({ from, to, trend }, index) => {
          const rate = getRate(from, to);
          const fromInfo = currencyInfo[from] || { name: from, flag: '🌐', color: 'from-gray-500 to-gray-600' };
          const toInfo = currencyInfo[to] || { name: to, flag: '🌐', color: 'from-gray-500 to-gray-600' };
          
          return (
            <div 
              key={`${from}-${to}`} 
              className="stat-card animate-fade-in-up opacity-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{fromInfo.flag}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-2xl">{toInfo.flag}</span>
                </div>
                {trend === 'up' ? (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 text-xs font-medium">
                    <ArrowUpRight className="w-3 h-3" />
                    上涨
                  </div>
                ) : trend === 'down' ? (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-medium">
                    <ArrowDownRight className="w-3 h-3" />
                    下跌
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                    稳定
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {fromInfo.name} / {toInfo.name}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {rate ? rate.rate.toFixed(4) : '-'}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  {rate ? `来源: ${rate.source.includes('BANK_OF_CHINA') ? '中国银行' : rate.source}` : '暂无数据'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 中国银行汇率预览 */}
      {showPreview && bocPreview.length > 0 && (
        <div className="modern-card animate-fade-in-scale">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">中国银行实时汇率</h3>
                <p className="text-sm text-gray-400">现汇卖出价（用于结算）</p>
              </div>
            </div>
            <button
              onClick={syncBocRates}
              disabled={isSyncing}
              className="btn-gradient flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {isSyncing ? '同步中...' : '确认同步'}
            </button>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>币种</th>
                  <th className="text-right">现汇买入价</th>
                  <th className="text-right bg-amber-50">现汇卖出价 ⭐</th>
                  <th className="text-right">现钞买入价</th>
                  <th className="text-right">现钞卖出价</th>
                  <th className="text-right">中行折算价</th>
                </tr>
              </thead>
              <tbody>
                {bocPreview.map((rate, index) => (
                  <tr key={index}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{currencyInfo[rate.currency]?.flag || '🌐'}</span>
                        <div>
                          <div className="font-medium text-gray-900">{rate.currencyName}</div>
                          <div className="text-xs text-gray-400">{rate.currency}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right text-gray-600">
                      {rate.buyingRate?.toFixed(4) || '-'}
                    </td>
                    <td className="text-right font-bold text-gray-900 bg-amber-50">
                      {rate.sellingRate?.toFixed(4) || '-'}
                    </td>
                    <td className="text-right text-gray-600">
                      {rate.cashBuyingRate?.toFixed(4) || '-'}
                    </td>
                    <td className="text-right text-gray-600">
                      {rate.cashSellingRate?.toFixed(4) || '-'}
                    </td>
                    <td className="text-right text-gray-600">
                      {rate.middleRate?.toFixed(4) || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 汇率历史记录 */}
      <div className="modern-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">汇率记录</h3>
            <p className="text-sm text-gray-400">历史汇率数据</p>
          </div>
        </div>
        
        {rates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">暂无汇率数据</p>
            <p className="text-sm text-gray-400 mt-1">点击"同步汇率"获取最新汇率</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>货币对</th>
                  <th className="text-right">汇率</th>
                  <th>来源</th>
                </tr>
              </thead>
              <tbody>
                {rates.slice(0, 20).map((rate) => (
                  <tr key={rate.id}>
                    <td className="text-gray-600">{rate.rate_date}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span>{currencyInfo[rate.from_currency]?.flag || '🌐'}</span>
                        <span className="font-medium text-gray-900">{rate.from_currency}</span>
                        <ArrowRight className="w-3 h-3 text-gray-300" />
                        <span>{currencyInfo[rate.to_currency]?.flag || '🌐'}</span>
                        <span className="font-medium text-gray-900">{rate.to_currency}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <span className="font-mono font-semibold text-gray-900">
                        {rate.rate.toFixed(6)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        rate.source.includes('BANK_OF_CHINA') 
                          ? 'badge-success' 
                          : 'badge-info'
                      }`}>
                        {rate.source.includes('BANK_OF_CHINA') ? '中国银行' : rate.source}
                      </span>
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
