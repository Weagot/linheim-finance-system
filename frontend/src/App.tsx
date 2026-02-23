import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Invoices from './pages/Invoices';
import Companies from './pages/Companies';
import ExchangeRates from './pages/ExchangeRates';
import Reports from './pages/Reports';
import Layout from './components/Layout';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ToastContainer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// 开发模式：直接跳过登录
const DEV_MODE_SKIP_LOGIN = true;

function App() {
  return (
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {DEV_MODE_SKIP_LOGIN ? (
            // 开发模式：直接显示主界面
            <>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/companies" element={<Companies />} />
                  <Route path="/exchange-rates" element={<ExchangeRates />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
              <ToastContainer />
            </>
          ) : (
            // 生产模式：需要登录
            <>
              <LoginPage />
              <ToastContainer />
            </>
          )}
        </BrowserRouter>
      </QueryClientProvider>
    </ToastProvider>
  );
}

export default App;
