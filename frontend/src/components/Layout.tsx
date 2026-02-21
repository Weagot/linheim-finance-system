import { Link, useLocation } from 'react-router-dom';
import { Home, Receipt, FileText, BarChart3, Menu, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useCurrentUser, useLogout } from '../lib/hooks';

const navItems = [
  { path: '/', label: '仪表盘', icon: Home },
  { path: '/transactions', label: '财务流水', icon: Receipt },
  { path: '/invoices', label: '开票管理', icon: FileText },
  { path: '/reports', label: '报表中心', icon: BarChart3 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const handleLogout = async () => {
    await logout.mutateAsync();
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50
          ${sidebarOpen ? 'w-64' : 'w-16'}
        `}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">林</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-gray-900">林海财务</h1>
                <p className="text-xs text-gray-500">Linheim Finance</p>
              </div>
            )}
          </div>
        </div>

        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200
                  ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header */}
        <header className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {navItems.find((item) => item.path === location.pathname)?.label || '仪表盘'}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Guest'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                title="退出登录"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
