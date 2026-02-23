import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Receipt, 
  FileText, 
  BarChart3, 
  Building2, 
  Menu, 
  LogOut, 
  User, 
  ArrowLeftRight, 
  X,
  Sparkles,
  Settings,
  Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCurrentUser, useLogout } from '../lib/hooks';

const navItems = [
  { path: '/', label: '仪表盘', icon: Home, gradient: 'from-violet-500 to-purple-500' },
  { path: '/transactions', label: '财务流水', icon: Receipt, gradient: 'from-blue-500 to-cyan-500' },
  { path: '/invoices', label: '开票管理', icon: FileText, gradient: 'from-emerald-500 to-teal-500' },
  { path: '/companies', label: '公司管理', icon: Building2, gradient: 'from-orange-500 to-amber-500' },
  { path: '/exchange-rates', label: '汇率管理', icon: ArrowLeftRight, gradient: 'from-pink-500 to-rose-500' },
  { path: '/reports', label: '报表中心', icon: BarChart3, gradient: 'from-indigo-500 to-blue-500' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout.mutateAsync();
    window.location.href = '/';
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const NavLinks = () => (
    <nav className="p-3 space-y-1.5">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`
              nav-item animate-fade-in-up opacity-0
              ${isActive ? 'active' : ''}
            `}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className={`
              w-9 h-9 rounded-xl flex items-center justify-center
              bg-gradient-to-br ${item.gradient} p-0.5
            `}>
              <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isActive ? 'bg-white' : 'bg-white/90'}`}>
                <Icon className={`w-4.5 h-4.5 ${isActive ? `text-transparent bg-gradient-to-br ${item.gradient} bg-clip-text` : 'text-gray-600'}`} />
              </div>
            </div>
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden animate-fade-in-scale"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex fixed left-0 top-0 h-full z-50
          transition-all duration-300 ease-out
          ${sidebarOpen ? 'w-72' : 'w-20'}
        `}
      >
        <div className="flex-1 flex flex-col m-3 rounded-2xl overflow-hidden glass-card">
          {/* Logo */}
          <div className={`p-5 border-b border-gray-100/50 ${sidebarOpen ? '' : 'flex justify-center'}`}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <span className="text-white font-bold text-lg">林</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
              </div>
              {sidebarOpen && (
                <div className="animate-fade-in-up">
                  <h1 className="font-bold text-gray-900 text-lg">林海财务</h1>
                  <p className="text-xs text-gray-400 tracking-wide">Linheim Finance</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <NavLinks />
          </div>

          {/* Bottom Section */}
          {sidebarOpen && (
            <div className="p-4 border-t border-gray-100/50">
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-purple-100/50">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-purple-700">专业版</span>
                </div>
                <p className="text-xs text-purple-600/70">解锁全部高级功能</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full w-72 z-50
          transition-transform duration-300 ease-out
          md:hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full m-3 rounded-2xl overflow-hidden glass-card flex flex-col">
          {/* Logo */}
          <div className="p-5 border-b border-gray-100/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-white font-bold text-lg">林</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg">林海财务</h1>
                <p className="text-xs text-gray-400 tracking-wide">Linheim Finance</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="icon-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <NavLinks />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={`
          flex-1 transition-all duration-300 ease-out
          ${!isMobile && sidebarOpen ? 'md:ml-72' : !isMobile ? 'md:ml-20' : ''}
        `}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 px-4 md:px-6 py-3 md:py-4">
          <div className="glass-card px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <button
                  onClick={toggleSidebar}
                  className="icon-btn"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-base md:text-xl font-bold text-gray-900">
                    {navItems.find((item) => item.path === location.pathname)?.label || '仪表盘'}
                  </h2>
                  <p className="hidden md:block text-xs text-gray-400 mt-0.5">
                    {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                {/* Notification Bell */}
                <button className="icon-btn relative hidden md:flex">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Avatar */}
                <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-gray-200/50">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-400">{user?.role || 'Guest'}</p>
                  </div>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="icon-btn md:hidden"
                    title="退出登录"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>

                {/* Desktop Logout */}
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                  title="退出登录"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">退出</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
