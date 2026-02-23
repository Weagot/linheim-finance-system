import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
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

function App() {
  return (
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* 登录页面 */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* 受保护的路由 */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
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
                  </ProtectedRoute>
                }
              />
            </Routes>
            <ToastContainer />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ToastProvider>
  );
}

export default App;
