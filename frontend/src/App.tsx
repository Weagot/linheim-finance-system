import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCurrentUser } from './lib/hooks';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Layout from './components/Layout';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ToastContainer';

// 开发模式：跳过登录检查
const DEV_MODE_SKIP_AUTH = true;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const { data: user, isLoading } = useCurrentUser();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">正在加载...</p>
        </div>
      </div>
    );
  }

  // 开发模式：跳过登录检查
  if (DEV_MODE_SKIP_AUTH) {
    return (
      <>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Layout>
        <ToastContainer />
      </>
    );
  }

  // If not logged in, show login page
  if (!user) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  // User is logged in, show protected routes
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </ToastProvider>
  );
}

export default App;
