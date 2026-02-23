import { useState, useEffect } from 'react';
import { Plus, Search, Download, FileText, CheckCircle, Clock, XCircle, Calculator, X, Building2, Euro, DollarSign, JapaneseYen, PoundSterling, Sparkles, Coins } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { exportToExcel, formatDate } from '../lib/excel';
import { invoicesApi, companiesApi, exchangeRatesApi } from '../lib/api';

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date?: string;
  total_amount: number;
  currency: string;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE';
  client_name: string;
  description?: string;
  company_id: string;
  company?: { name: string; currency: string };
  exchange_rate?: number;
  exchange_rate_date?: string;
  exchange_rate_source?: string;
  amount_cny?: number;
}

interface Company {
  id: string;
  name: string;
  code: string;
  currency: string;
}

const statusConfig = {
  DRAFT: { label: '草稿', color: 'badge-info', icon: FileText, gradient: 'from-gray-500 to-slate-500' },
  ISSUED: { label: '已发出', color: 'badge-warning', icon: Clock, gradient: 'from-blue-500 to-cyan-500' },
  PAID: { label: '已付款', color: 'badge-success', icon: CheckCircle, gradient: 'from-emerald-500 to-green-500' },
  OVERDUE: { label: '已逾期', color: 'badge-danger', icon: XCircle, gradient: 'from-red-500 to-rose-500' },
};

const currencyConfig: Record<string, { symbol: string; icon: any; color: string }> = {
  EUR: { symbol: '€', icon: Euro, color: 'from-blue-500 to-indigo-500' },
  CNY: { symbol: '¥', icon: JapaneseYen, color: 'from-red-500 to-rose-500' },
  USD: { symbol: '$', icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
  GBP: { symbol: '£', icon: PoundSterling, color: 'from-purple-500 to-violet-500' },
  HKD: { symbol: 'HK$', icon: DollarSign, color: 'from-orange-500 to-amber-500' },
};

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    total_amount: '',
    currency: 'EUR',
    client_name: '',
    client_tax_id: '',
    company_id: '',
    description: '',
    items: [] as any[],
  });
  const [previewRate, setPreviewRate] = useState<number | null>(null);
  
  const toast = useToast();

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invoicesData, companiesData] = await Promise.all([
        invoicesApi.getAll(),
        companiesApi.getAll(),
      ]);
      setInvoices(invoicesData || []);
      setCompanies(companiesData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.show('加载数据失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 预览汇率
  useEffect(() => {
    if (formData.currency && formData.currency !== 'CNY' && formData.invoice_date) {
      previewExchangeRate();
    }
  }, [formData.currency, formData.invoice_date]);

  const previewExchangeRate = async () => {
    try {
      const result = await exchangeRatesApi.getLatest(formData.currency, 'CNY', formData.invoice_date);
      if (result.rate) {
        setPreviewRate(result.rate);
      }
    } catch (error) {
      console.error('Failed to get exchange rate:', error);
    }
  };

  // 创建/更新发票
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const invoiceData = {
        company_id: formData.company_id,
        client_name: formData.client_name,
        client_tax_id: formData.client_tax_id,
        issue_date: formData.invoice_date,
        due_date: formData.due_date || null,
        total_amount: parseFloat(formData.total_amount),
        currency: formData.currency,
        subtotal: parseFloat(formData.total_amount),
        tax_amount: 0,
        items: formData.items.length > 0 ? formData.items : [{ description: formData.description, quantity: 1, unit_price: parseFloat(formData.total_amount) }],
      };

      if (editingInvoice) {
        await invoicesApi.update(editingInvoice.id, invoiceData);
        toast.show('发票已更新', 'success');
      } else {
        await invoicesApi.create(invoiceData);
        toast.show('发票已创建', 'success');
      }
      
      setShowModal(false);
      setEditingInvoice(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to save invoice:', error);
      toast.show('保存发票失败', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: '',
      total_amount: '',
      currency: 'EUR',
      client_name: '',
      client_tax_id: '',
      company_id: companies[0]?.id || '',
      description: '',
      items: [],
    });
    setPreviewRate(null);
  };

  // 导出
  const handleExport = () => {
    const data = invoices.map(inv => ({
      '发票号': inv.invoice_number,
      '开票日期': inv.issue_date,
      '客户名称': inv.client_name,
      '金额': `${currencyConfig[inv.currency]?.symbol || ''}${inv.total_amount}`,
      '币种': inv.currency,
      '汇率': inv.exchange_rate || '-',
      '人民币金额': inv.amount_cny ? `¥${inv.amount_cny.toFixed(2)}` : '-',
      '状态': statusConfig[inv.status]?.label || inv.status,
    }));
    exportToExcel(data, `发票记录_${formatDate(new Date())}`, '发票');
    toast.show('已导出Excel', 'success');
  };

  // 过滤发票
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = !searchQuery || 
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // 计算预览金额
  const previewAmountCNY = previewRate && formData.total_amount 
    ? (parseFloat(formData.total_amount) * previewRate).toFixed(2) 
    : null;

  // 统计数据
  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'PAID').length,
    pending: invoices.filter(i => i.status === 'ISSUED').length,
    overdue: invoices.filter(i => i.status === 'OVERDUE').length,
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">发票管理</h1>
          </div>
          <p className="text-sm text-gray-500">管理客户发票，汇率自动关联</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-200">
            <Download className="w-4 h-4" />
            导出
          </button>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn-gradient flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建发票
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-500 mb-1">全部发票</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 mb-1">已付款</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.paid}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 mb-1">待付款</p>
          <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500 mb-1">已逾期</p>
          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索发票号或客户名称..."
              className="modern-input pl-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="modern-select md:w-48"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">全部状态</option>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoice List */}
      <div className="modern-card">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <FileText className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">暂无发票数据</p>
            <p className="text-sm text-gray-400 mt-1">点击"新建发票"创建第一张发票</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>发票号</th>
                  <th>日期</th>
                  <th>客户</th>
                  <th className="text-right">金额</th>
                  <th className="text-right">汇率</th>
                  <th className="text-right">人民币金额</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice, index) => {
                  const StatusIcon = statusConfig[invoice.status]?.icon || FileText;
                  const currencyInfo = currencyConfig[invoice.currency] || { symbol: '', icon: DollarSign, color: 'from-gray-500 to-gray-600' };
                  
                  return (
                    <tr key={invoice.id} className="animate-fade-in-up opacity-0" style={{ animationDelay: `${index * 0.05}s` }}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currencyInfo.color} flex items-center justify-center`}>
                            <currencyInfo.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold text-gray-900">{invoice.invoice_number}</span>
                        </div>
                      </td>
                      <td className="text-gray-600">{invoice.issue_date}</td>
                      <td>
                        <div className="font-medium text-gray-900">{invoice.client_name}</div>
                        <div className="text-xs text-gray-400">{invoice.company?.name}</div>
                      </td>
                      <td className="text-right">
                        <span className="font-semibold text-gray-900 font-mono">
                          {currencyInfo.symbol}{invoice.total_amount.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">{invoice.currency}</span>
                      </td>
                      <td className="text-right text-gray-600">
                        {invoice.exchange_rate ? (
                          <div>
                            <div className="font-mono font-medium">{invoice.exchange_rate.toFixed(4)}</div>
                            <div className="text-xs text-gray-400">{invoice.exchange_rate_source?.includes('BANK_OF_CHINA') ? '中国银行' : invoice.exchange_rate_source}</div>
                          </div>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="text-right font-mono font-semibold text-gray-900">
                        {invoice.amount_cny ? `¥${invoice.amount_cny.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : <span className="text-gray-300">-</span>}
                      </td>
                      <td>
                        <span className={`badge ${statusConfig[invoice.status]?.color} flex items-center gap-1.5 w-fit`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[invoice.status]?.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-scale">
          <div className="glass-card w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingInvoice ? '编辑发票' : '新建发票'}
                  </h2>
                </div>
                <button
                  onClick={() => { setShowModal(false); setEditingInvoice(null); }}
                  className="icon-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">开票公司</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    className="modern-select pl-11"
                    value={formData.company_id}
                    onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                    required
                  >
                    <option value="">选择公司</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">客户名称</label>
                <input
                  type="text"
                  className="modern-input"
                  placeholder="输入客户名称"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">开票日期</label>
                  <input
                    type="date"
                    className="modern-input"
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">到期日期</label>
                  <input
                    type="date"
                    className="modern-input"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">币种</label>
                  <select
                    className="modern-select"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="EUR">EUR 欧元</option>
                    <option value="CNY">CNY 人民币</option>
                    <option value="USD">USD 美元</option>
                    <option value="GBP">GBP 英镑</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">金额</label>
                  <input
                    type="number"
                    step="0.01"
                    className="modern-input"
                    placeholder="0.00"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* 汇率预览 */}
              {formData.currency !== 'CNY' && previewRate && (
                <div className="glass-card p-4 border-l-4 border-l-emerald-500 bg-emerald-50/50">
                  <div className="flex items-center gap-2 text-emerald-700 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium text-sm">汇率自动关联</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">汇率</p>
                      <p className="font-mono font-semibold text-gray-900">{previewRate.toFixed(4)}</p>
                      <p className="text-xs text-gray-400">中国银行现汇卖出价</p>
                    </div>
                    {previewAmountCNY && (
                      <div>
                        <p className="text-gray-500">人民币金额</p>
                        <p className="font-semibold text-gray-900">¥{previewAmountCNY}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100/50">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingInvoice(null); }}
                  className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200 font-medium"
                >
                  取消
                </button>
                <button type="submit" className="btn-gradient">
                  {editingInvoice ? '更新' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
