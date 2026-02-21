import { useState } from 'react';
import { Building2, Plus, Search, Edit, Trash2, MapPin, DollarSign, Globe } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface Company {
  id: string;
  name: string;
  code: string;
  currency: string;
  country: string;
  type: string;
}

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Deyou international GmbH',
    code: 'DEYOU',
    currency: 'EUR',
    country: 'Germany',
    type: 'warehouse',
  },
  {
    id: '2',
    name: 'Wanling GmbH',
    code: 'WANLING',
    currency: 'EUR',
    country: 'Germany',
    type: 'hr',
  },
  {
    id: '3',
    name: '江苏程辉商贸有限公司',
    code: 'JSCHENG',
    currency: 'CNY',
    country: 'China',
    type: 'billing',
  },
];

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    currency: 'EUR',
    country: '',
    type: 'warehouse',
  });

  const toast = useToast();

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        code: company.code,
        currency: company.currency,
        country: company.country,
        type: company.type,
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: '',
        code: '',
        currency: 'EUR',
        country: '',
        type: 'warehouse',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCompany(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !formData.country) {
      toast.show('请填写完整信息', 'warning');
      return;
    }

    if (editingCompany) {
      // Update existing company
      setCompanies(
        companies.map((c) =>
          c.id === editingCompany.id
            ? { ...c, ...formData }
            : c
        )
      );
      toast.show('公司信息已更新', 'success');
    } else {
      // Create new company
      const newCompany: Company = {
        id: Date.now().toString(),
        ...formData,
      };
      setCompanies([...companies, newCompany]);
      toast.show('新公司已创建', 'success');
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这家公司吗？')) {
      setCompanies(companies.filter((c) => c.id !== id));
      toast.show('公司已删除', 'success');
    }
  };

  const companyTypeLabels: Record<string, string> = {
    warehouse: '海外仓',
    hr: '人力资源',
    billing: '开票公司',
  };

  const currencyLabels: Record<string, string> = {
    EUR: 'EUR (€)',
    CNY: 'CNY (¥)',
    USD: 'USD ($)',
    GBP: 'GBP (£)',
    HKD: 'HKD (HK$)',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">公司管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理集团旗下所有公司</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增公司
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索公司名称或代码..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">公司总数</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{companies.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">德国公司</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {companies.filter((c) => c.country === 'Germany').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">中国公司</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {companies.filter((c) => c.country === 'China').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">币种数量</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {new Set(companies.map((c) => c.currency)).size}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Companies List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">公司代码</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">公司名称</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">国家</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">币种</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">类型</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery ? '未找到匹配的公司' : '暂无公司，点击"新增公司"添加'}
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        {company.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {company.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{company.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{company.country}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{currencyLabels[company.currency] || company.currency}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {companyTypeLabels[company.type] || company.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(company)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCompany ? '编辑公司' : '新增公司'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  公司名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="例如：Deyou international GmbH"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    公司代码
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="input-field"
                    placeholder="例如：DEYOU"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    国家
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="input-field"
                    placeholder="例如：Germany"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    公司类型
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="warehouse">海外仓</option>
                    <option value="hr">人力资源</option>
                    <option value="billing">开票公司</option>
                  </select>
                </div>
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
