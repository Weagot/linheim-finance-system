import { useState } from 'react';
import { Plus, Search, Download, Filter, ArrowUpDown, Trash2, Edit2, FileSpreadsheet } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { exportToExcel, formatDate } from '../lib/excel';

interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  companyId: string;
  companyName: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  relatedCompany?: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2026-02-21',
    type: 'income',
    companyId: '1',
    companyName: 'Deyou international GmbH',
    description: '客户A - 仓储服务费',
    amount: 2500,
    currency: 'EUR',
    category: '仓储',
  },
  {
    id: '2',
    date: '2026-02-21',
    type: 'expense',
    companyId: '1',
    companyName: 'Deyou international GmbH',
    description: '支付给供应商B - 运输费',
    amount: 1850,
    currency: 'EUR',
    category: '运输',
  },
  {
    id: '3',
    date: '2026-02-20',
    type: 'transfer',
    companyId: '1',
    companyName: 'Deyou → Wanling',
    description: '人力资源费结算',
    amount: 3200,
    currency: 'EUR',
    category: '内部转账',
    relatedCompany: 'Wanling GmbH',
  },
  {
    id: '4',
    date: '2026-02-19',
    type: 'income',
    companyId: '3',
    companyName: '江苏程辉商贸有限公司',
    description: '客户C - 仓储服务费',
    amount: 25000,
    currency: 'CNY',
    category: '仓储',
  },
  {
    id: '5',
    date: '2026-02-18',
    type: 'expense',
    companyId: '2',
    companyName: 'Wanling GmbH',
    description: '员工工资 - 1月',
    amount: 15000,
    currency: 'EUR',
    category: '人工',
  },
];

const mockCompanies = [
  { id: '1', name: 'Deyou international GmbH', code: 'DEYOU', currency: 'EUR' },
  { id: '2', name: 'Wanling GmbH', code: 'WANLING', currency: 'EUR' },
  { id: '3', name: '江苏程辉商贸有限公司', code: 'JSCHENG', currency: 'CNY' },
];

const categories = ['仓储', '运输', '人工', '租金', '设备', '办公', '其他', '内部转账'];

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'type'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'income' as 'income' | 'expense' | 'transfer',
    companyId: '',
    description: '',
    amount: '',
    currency: 'EUR',
    category: '',
    relatedCompanyId: '',
  });

  const toast = useToast();

  const filteredTransactions = transactions
    .filter((t) => {
      const matchesSearch =
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.companyName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !filterType || t.type === filterType;
      const matchesCompany = !filterCompany || t.companyId === filterCompany;
      const matchesCurrency = !filterCurrency || t.currency === filterCurrency;
      return matchesSearch && matchesType && matchesCompany && matchesCurrency;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortField === 'amount') {
        comparison = b.amount - a.amount;
      } else if (sortField === 'type') {
        comparison = a.type.localeCompare(b.type);
      }
      return sortDirection === 'asc' ? -comparison : comparison;
    });

  const toggleSort = (field: 'date' | 'amount' | 'type') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleOpenModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        date: transaction.date,
        type: transaction.type,
        companyId: transaction.companyId,
        description: transaction.description,
        amount: transaction.amount.toString(),
        currency: transaction.currency,
        category: transaction.category,
        relatedCompanyId: '',
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        companyId: '',
        description: '',
        amount: '',
        currency: 'EUR',
        category: '',
        relatedCompanyId: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyId || !formData.description || !formData.amount || !formData.category) {
      toast.show('请填写完整信息', 'warning');
      return;
    }

    const company = mockCompanies.find((c) => c.id === formData.companyId);
    const companyName = company?.name || '';

    if (editingTransaction) {
      setTransactions(
        transactions.map((t) =>
          t.id === editingTransaction.id
            ? {
                ...t,
                date: formData.date,
                type: formData.type,
                companyId: formData.companyId,
                companyName,
                description: formData.description,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                category: formData.category,
              }
            : t
        )
      );
      toast.show('流水已更新', 'success');
    } else {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        date: formData.date,
        type: formData.type,
        companyId: formData.companyId,
        companyName,
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        category: formData.category,
      };
      setTransactions([newTransaction, ...transactions]);
      toast.show('新流水已创建', 'success');
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条流水吗？')) {
      setTransactions(transactions.filter((t) => t.id !== id));
      toast.show('流水已删除', 'success');
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) {
      toast.show('请先选择要删除的流水', 'warning');
      return;
    }
    if (confirm(`确定要删除选中的 ${selectedIds.size} 条流水吗？`)) {
      setTransactions(transactions.filter((t) => !selectedIds.has(t.id)));
      setSelectedIds(new Set());
      toast.show('批量删除成功', 'success');
    }
  };

  const handleExport = () => {
    const data = filteredTransactions.map((t) => ({
      '日期': t.date,
      '类型': t.type === 'income' ? '收入' : t.type === 'expense' ? '支出' : '转账',
      '公司': t.companyName,
      '描述': t.description,
      '金额': t.amount,
      '币种': t.currency,
      '分类': t.category,
      '关联公司': t.relatedCompany || '-',
    }));

    exportToExcel(data, `财务流水_${formatDate(new Date())}`, '财务流水');
    toast.show('Excel 导出成功', 'success');
  };

  const typeColors = {
    income: { bg: 'bg-green-100', text: 'text-green-700', label: '收入' },
    expense: { bg: 'bg-red-100', text: 'text-red-700', label: '支出' },
    transfer: { bg: 'bg-blue-100', text: 'text-blue-700', label: '转账' },
  };

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">财务流水</h1>
          <p className="text-sm text-gray-500 mt-1">管理所有收支记录和公司间转账</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            导出
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增流水
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">总收入</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {filteredTransactions
                  .filter((t) => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}{' '}
                EUR
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">总支出</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {filteredTransactions
                  .filter((t) => t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}{' '}
                EUR
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📉</span>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">净收支</p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {(totalIncome - totalExpense).toLocaleString()} EUR
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索流水..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {showFilters && (
            <>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field w-[150px]"
              >
                <option value="">所有类型</option>
                <option value="income">收入</option>
                <option value="expense">支出</option>
                <option value="transfer">转账</option>
              </select>
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="input-field w-[200px]"
              >
                <option value="">所有公司</option>
                {mockCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
                className="input-field w-[150px]"
              >
                <option value="">所有币种</option>
                <option value="EUR">EUR (€)</option>
                <option value="CNY">CNY (¥)</option>
                <option value="USD">USD ($)</option>
              </select>
            </>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-blue-50 text-blue-600' : ''}`}
          >
            <Filter className="w-4 h-4" />
            筛选
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-700">
              已选择 {selectedIds.size} 条记录
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="btn-secondary text-sm py-1"
            >
              取消选择
            </button>
            <button
              onClick={handleBulkDelete}
              className="btn-secondary text-sm py-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              批量删除
            </button>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-10 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={filteredTransactions.every((t) => selectedIds.has(t.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(new Set(filteredTransactions.map((t) => t.id)));
                      } else {
                        setSelectedIds(new Set());
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th
                  className="text-left px-6 py-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('date')}
                >
                  日期 {sortField === 'date' && <ArrowUpDown className="w-4 h-4 inline ml-1" />}
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">类型</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">公司</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">描述</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">分类</th>
                <th
                  className="text-left px-6 py-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('amount')}
                >
                  金额{' '}
                  {sortField === 'amount' && <ArrowUpDown className="w-4 h-4 inline ml-1" />}
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery || filterType || filterCompany
                      ? '未找到匹配的流水'
                      : '暂无流水，点击"新增流水"添加'}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const typeInfo = typeColors[t.type];
                  return (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(t.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedIds);
                            if (e.target.checked) {
                              newSelected.add(t.id);
                            } else {
                              newSelected.delete(t.id);
                            }
                            setSelectedIds(newSelected);
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{t.date}</td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex px-2 py-1 rounded text-xs font-medium ${typeInfo.bg} ${typeInfo.text}`}>
                          {typeInfo.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{t.companyName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={t.description}>
                        {t.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{t.category}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-semibold ${
                            t.type === 'income' ? 'text-green-600' : t.type === 'expense' ? 'text-red-600' : 'text-gray-900'
                          }`}
                        >
                          {t.type === 'expense' ? '-' : ''}
                          {t.amount.toLocaleString()} {t.currency}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(t)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTransaction ? '编辑财务流水' : '新增财务流水'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    公司
                  </label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => {
                      const company = mockCompanies.find((c) => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        companyId: e.target.value,
                        currency: company?.currency || 'EUR',
                      });
                    }}
                    className="input-field"
                    required
                  >
                    <option value="">选择公司</option>
                    {mockCompanies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    类型
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as 'income' | 'expense' | 'transfer' })
                    }
                    className="input-field"
                    required
                  >
                    <option value="income">收入</option>
                    <option value="expense">支出</option>
                    <option value="transfer">转账</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    金额
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    币种
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="input-field"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="CNY">CNY (¥)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="HKD">HKD (HK$)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分类
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">选择分类</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  placeholder="输入描述（如：客户A - 仓储服务费）"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日期
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button type="submit" className="btn-primary">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
