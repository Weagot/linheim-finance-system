import { Plus, Search, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function Invoices() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">开票管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理发票，自动生成PDF</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <FileText className="w-4 h-4" />
            导入模板
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新开发票
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InvoiceStatCard
          title="本月开票"
          value="28"
          icon={FileText}
          color="blue"
        />
        <InvoiceStatCard
          title="待开票"
          value="3"
          icon={Clock}
          color="yellow"
        />
        <InvoiceStatCard
          title="已付款"
          value="25"
          icon={CheckCircle}
          color="green"
        />
        <InvoiceStatCard
          title="逾期未付"
          value="2"
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索发票..."
                className="input-field pl-10"
              />
            </div>
          </div>
          <select className="input-field w-[150px]">
            <option value="">所有状态</option>
            <option value="draft">草稿</option>
            <option value="issued">已开票</option>
            <option value="paid">已付款</option>
            <option value="overdue">逾期</option>
          </select>
          <select className="input-field w-[200px]">
            <option value="">开票公司</option>
            <option value="deyou">Deyou international GmbH</option>
            <option value="wanling">Wanling GmbH</option>
            <option value="jscheng">江苏程辉商贸有限公司</option>
          </select>
        </div>
      </div>

      {/* Invoices List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">发票号</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">日期</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">开票公司</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">收票方</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">金额</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">状态</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <InvoiceTableRow
                invoiceNumber="INV-2026-001"
                date="2026-02-21"
                issuer="Deyou international GmbH"
                receiver="客户A"
                amount="€2,500"
                status="paid"
              />
              <InvoiceTableRow
                invoiceNumber="INV-2026-002"
                date="2026-02-20"
                issuer="江苏程辉商贸有限公司"
                receiver="客户B"
                amount="¥15,000"
                status="issued"
              />
              <InvoiceTableRow
                invoiceNumber="INV-2026-003"
                date="2026-02-19"
                issuer="Deyou international GmbH"
                receiver="客户C"
                amount="€5,800"
                status="overdue"
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">新开发票</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    开票公司
                  </label>
                  <select className="input-field">
                    <option value="">选择公司</option>
                    <option value="deyou">Deyou international GmbH</option>
                    <option value="wanling">Wanling GmbH</option>
                    <option value="jscheng">江苏程辉商贸有限公司</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    发票号码
                  </label>
                  <input
                    type="text"
                    placeholder="INV-2026-004"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    发票日期
                  </label>
                  <input type="date" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    到期日期
                  </label>
                  <input type="date" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  收票方
                </label>
                <input
                  type="text"
                  placeholder="客户名称"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    金额
                  </label>
                  <input type="number" placeholder="输入金额" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    币种
                  </label>
                  <select className="input-field">
                    <option value="EUR">EUR (€)</option>
                    <option value="CNY">CNY (¥)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  服务内容
                </label>
                <textarea
                  rows={3}
                  placeholder="输入服务内容（如：仓储服务、运输服务等）"
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button className="btn-secondary">
                保存草稿
              </button>
              <button className="btn-primary flex items-center gap-2">
                <FileText className="w-4 h-4" />
                生成发票
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceStatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: any;
  color: string;
}) {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorMap[color as keyof typeof colorMap]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function InvoiceTableRow({
  invoiceNumber,
  date,
  issuer,
  receiver,
  amount,
  status,
}: {
  invoiceNumber: string;
  date: string;
  issuer: string;
  receiver: string;
  amount: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue';
}) {
  const statusMap = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: '草稿' },
    issued: { bg: 'bg-blue-100', text: 'text-blue-700', label: '已开票' },
    paid: { bg: 'bg-green-100', text: 'text-green-700', label: '已付款' },
    overdue: { bg: 'bg-red-100', text: 'text-red-700', label: '逾期' },
  };

  const statusInfo = statusMap[status];

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoiceNumber}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{date}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{issuer}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{receiver}</td>
      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{amount}</td>
      <td className="px-6 py-4">
        <div className={`inline-flex px-2 py-1 rounded text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
          {statusInfo.label}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <button className="text-sm text-primary-600 hover:text-primary-700">
            下载
          </button>
          <button className="text-sm text-gray-600 hover:text-gray-700">
            编辑
          </button>
        </div>
      </td>
    </tr>
  );
}
