import { Plus, Search, Filter, Download } from 'lucide-react';
import { useState } from 'react';

export default function Transactions() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">财务流水</h1>
          <p className="text-sm text-gray-500 mt-1">管理所有收支记录和公司间转账</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增流水
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索流水..."
                className="input-field pl-10"
              />
            </div>
          </div>
          <select className="input-field w-[150px]">
            <option value="">所有类型</option>
            <option value="income">收入</option>
            <option value="expense">支出</option>
            <option value="transfer">转账</option>
          </select>
          <select className="input-field w-[200px]">
            <option value="">所有公司</option>
            <option value="deyou">Deyou international GmbH</option>
            <option value="wanling">Wanling GmbH</option>
            <option value="jscheng">江苏程辉商贸有限公司</option>
          </select>
          <select className="input-field w-[150px]">
            <option value="">所有币种</option>
            <option value="EUR">EUR (€)</option>
            <option value="CNY">CNY (¥)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">日期</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">类型</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">公司</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">描述</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">金额</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <TransactionTableRow
                date="2026-02-21"
                type="income"
                company="Deyou international GmbH"
                description="客户A - 仓储服务费"
                amount="€2,500"
                currency="EUR"
              />
              <TransactionTableRow
                date="2026-02-21"
                type="expense"
                company="Deyou international GmbH"
                description="支付给供应商B - 运输费"
                amount="€1,850"
                currency="EUR"
              />
              <TransactionTableRow
                date="2026-02-20"
                type="transfer"
                company="Deyou → Wanling"
                description="人力资源费结算"
                amount="€3,200"
                currency="EUR"
              />
              <TransactionTableRow
                date="2026-02-19"
                type="income"
                company="江苏程辉商贸有限公司"
                description="客户C - 仓储服务费"
                amount="¥25,000"
                currency="CNY"
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">新增财务流水</h2>
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
                    公司
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
                    类型
                  </label>
                  <select className="input-field">
                    <option value="">选择类型</option>
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
                  placeholder="输入描述（如：客户A - 仓储服务费）"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日期
                </label>
                <input type="date" className="input-field" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button className="btn-primary">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionTableRow({
  date,
  type,
  company,
  description,
  amount,
  currency,
}: {
  date: string;
  type: 'income' | 'expense' | 'transfer';
  company: string;
  description: string;
  amount: string;
  currency: string;
}) {
  const typeMap = {
    income: { bg: 'bg-green-100', text: 'text-green-700', label: '收入' },
    expense: { bg: 'bg-red-100', text: 'text-red-700', label: '支出' },
    transfer: { bg: 'bg-blue-100', text: 'text-blue-700', label: '转账' },
  };

  const typeInfo = typeMap[type];

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 text-sm text-gray-900">{date}</td>
      <td className="px-6 py-4">
        <div className={`inline-flex px-2 py-1 rounded text-xs font-medium ${typeInfo.bg} ${typeInfo.text}`}>
          {typeInfo.label}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">{company}</td>
      <td className="px-6 py-4 text-sm text-gray-900">{description}</td>
      <td className="px-6 py-4">
        <span className={`font-semibold ${type === 'income' ? 'text-green-600' : type === 'expense' ? 'text-red-600' : 'text-gray-900'}`}>
          {type === 'expense' ? '-' : ''}{amount}
        </span>
        <span className="text-xs text-gray-500 ml-1">{currency}</span>
      </td>
      <td className="px-6 py-4">
        <button className="text-sm text-primary-600 hover:text-primary-700">
          编辑
        </button>
      </td>
    </tr>
  );
}
