import { useState } from 'react';
import { Plus, Search, Download, FileText, Edit2, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  amount: number;
  currency: string;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE';
  issuerCompanyName: string;
  receiverCompanyName?: string;
  description?: string;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2026-001',
    invoiceDate: '2026-02-21',
    dueDate: '2026-03-21',
    amount: 2500,
    currency: 'EUR',
    status: 'ISSUED',
    issuerCompanyName: 'Deyou international GmbH',
    receiverCompanyName: '客户A GmbH',
    description: '2月仓储服务费',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2026-002',
    invoiceDate: '2026-02-20',
    dueDate: '2026-03-20',
    amount: 1800,
    currency: 'EUR',
    status: 'PAID',
    issuerCompanyName: 'Deyou international GmbH',
    receiverCompanyName: '客户B GmbH',
    description: '2月运输服务费',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2026-003',
    invoiceDate: '2026-02-15',
    dueDate: '2026-02-15',
    amount: 5000,
    currency: 'CNY',
    status: 'OVERDUE',
    issuerCompanyName: '江苏程辉商贸有限公司',
    receiverCompanyName: '客户C有限公司',
    description: '1月仓储服务费',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2026-004',
    invoiceDate: '2026-02-18',
    dueDate: '2026-03-18',
    amount: 3200,
    currency: 'EUR',
    status: 'DRAFT',
    issuerCompanyName: 'Wanling GmbH',
    receiverCompanyName: 'Deyou international GmbH',
    description: '2月人力资源服务费',
  },
];

const mockCompanies = [
  { id: '1', name: 'Deyou international GmbH', code: 'DEYOU', currency: 'EUR' },
  { id: '2', name: 'Wanling GmbH', code: 'WANLING', currency: 'EUR' },
  { id: '3', name: '江苏程辉商贸有限公司', code: 'JSCHENG', currency: 'CNY' },
];

const statusConfig = {
  DRAFT: { label: '草稿', color: 'bg-gray-100 text-gray-700', icon: FileText },
  ISSUED: { label: '已发出', color: 'bg-blue-100 text-blue-700', icon: Clock },
  PAID: { label: '已付款', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  OVERDUE: { label: '已逾期', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterIssuer, setFilterIssuer] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    amount: '',
    currency: 'EUR',
    status: 'DRAFT' as 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE',
    issuerCompanyId: '',
    receiverName: '',
    description: '',
  });

  const toast = useToast();

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.receiverCompanyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (invoice?: Invoice) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData({
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate || '',
        amount: invoice.amount.toString(),
        currency: invoice.currency,
        status: invoice.status,
        issuerCompanyId: mockCompanies.find((c) => c.name === invoice.issuerCompanyName)?.id || '',
        receiverName: invoice.receiverCompanyName || '',
        description: invoice.description || '',
      });
    } else {
      setEditingInvoice(null);
      const nextNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
      setFormData({
        invoiceNumber: nextNumber,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        amount: '',
        currency: 'EUR',
        status: 'DRAFT',
        issuerCompanyId: '',
        receiverName: '',
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInvoice(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.invoiceNumber || !formData.amount || !formData.issuerCompanyId) {
      toast.show('请填写完整信息', 'warning');
      return;
    }

    const issuerCompany = mockCompanies.find((c) => c.id === formData.issuerCompanyId);

    if (editingInvoice) {
      setInvoices(
        invoices.map((i) =>
          i.id === editingInvoice.id
            ? {
                ...i,
                invoiceNumber: formData.invoiceNumber,
                invoiceDate: formData.invoiceDate,
                dueDate: formData.dueDate || undefined,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                status: formData.status,
                issuerCompanyName: issuerCompany?.name || '',
                receiverCompanyName: formData.receiverName || undefined,
                description: formData.description,
              }
            : i
        )
      );
      toast.show('发票已更新', 'success');
    } else {
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate || undefined,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        status: formData.status,
        issuerCompanyName: issuerCompany?.name || '',
        receiverCompanyName: formData.receiverName || undefined,
        description: formData.description,
      };
      setInvoices([newInvoice, ...invoices]);
      toast.show('新发票已创建', 'success');
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这张发票吗？')) {
      setInvoices(invoices.filter((i) => i.id !== id));
      toast.show('发票已删除', 'success');
    }
  };

  const handleUpdateStatus = (id: string, status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE') => {
    setInvoices(
      invoices.map((i) => (i.id === id ? { ...i, status } : i))
    );
    toast.show('发票状态已更新', 'success');
  };

  const handleExport = () => {
    const data = filteredInvoices.map((i) => ({
      发票号: i.invoiceNumber,
      开票日期: i.invoiceDate,
      到期日: i.dueDate || '-',
      金额: i.amount,
      币种: i.currency,
      状态: statusConfig[i.status].label,
      开票公司: i.issuerCompanyName,
      收票方: i.receiverCompanyName || '-',
      描述: i.description || '-',
    }));

    const csv =
      '发票号,开票日期,到期日,金额,币种,状态,开票公司,收票方,描述\n' +
      data
        .map(
          (row) =>
            `${row.发票号},${row.开票日期},${row.到期日},${row.金额},${row.币种},${row.状态},"${row.开票公司}","${row.收票方}","${row.描述}"`
        )
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `发票列表_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.show('导出成功', 'success');
  };

  const totalAmount = filteredInvoices.reduce((sum, i) => sum + i.amount, 0);
  const paidAmount = filteredInvoices
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = filteredInvoices
    .filter((i) => i.status === 'ISSUED')
    .reduce((sum, i) => sum + i.amount, 0);
  const overdueAmount = filteredInvoices
    .filter((i) => i.status === 'OVERDUE')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">开票管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理所有发票和收款记录</p>
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
            新增发票
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">总金额</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalAmount.toLocaleString()} EUR
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">已收款</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {paidAmount.toLocaleString()} EUR
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">待收款</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {pendingAmount.toLocaleString()} EUR
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">已逾期</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {overdueAmount.toLocaleString()} EUR
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索发票号、收票方或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-[150px]"
          >
            <option value="">所有状态</option>
            <option value="DRAFT">草稿</option>
            <option value="ISSUED">已发出</option>
            <option value="PAID">已付款</option>
            <option value="OVERDUE">已逾期</option>
          </select>
          <select
            value={filterIssuer}
            onChange={(e) => setFilterIssuer(e.target.value)}
            className="input-field w-[200px]"
          >
            <option value="">所有开票公司</option>
            {mockCompanies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoices List */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">发票号</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">开票日期</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">到期日</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">开票公司</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">收票方</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">金额</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">状态</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery || filterStatus ? '未找到匹配的发票' : '暂无发票，点击"新增发票"添加'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const statusInfo = statusConfig[invoice.status];
                  const StatusIcon = statusInfo.icon;
                  const isOverdue =
                    invoice.dueDate &&
                    new Date(invoice.dueDate) < new Date() &&
                    invoice.status === 'ISSUED';

                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{invoice.invoiceDate}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {invoice.dueDate || '-'}
                        {isOverdue && (
                          <span className="ml-2 text-xs text-red-600 font-medium">已逾期</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {invoice.issuerCompanyName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {invoice.receiverCompanyName || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          {invoice.amount.toLocaleString()} {invoice.currency}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium">
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusInfo.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {invoice.status === 'DRAFT' && (
                            <button
                              onClick={() => handleUpdateStatus(invoice.id, 'ISSUED')}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                              title="标记为已发出"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {invoice.status === 'ISSUED' && (
                            <button
                              onClick={() => handleUpdateStatus(invoice.id, 'PAID')}
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600"
                              title="标记为已付款"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModal(invoice)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingInvoice ? '编辑发票' : '新增发票'}
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
                    发票号
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="input-field"
                    placeholder="INV-2026-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    开票日期
                  </label>
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    到期日
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    状态
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' })
                    }
                    className="input-field"
                  >
                    <option value="DRAFT">草稿</option>
                    <option value="ISSUED">已发出</option>
                    <option value="PAID">已付款</option>
                    <option value="OVERDUE">已逾期</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    开票公司
                  </label>
                  <select
                    value={formData.issuerCompanyId}
                    onChange={(e) => {
                      const company = mockCompanies.find((c) => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        issuerCompanyId: e.target.value,
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
                    收票方
                  </label>
                  <input
                    type="text"
                    value={formData.receiverName}
                    onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                    className="input-field"
                    placeholder="客户名称"
                  />
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
                  </select>
                </div>
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
                  placeholder="输入发票描述"
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
