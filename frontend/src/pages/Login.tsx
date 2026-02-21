import { useState } from 'react';
import { Lock, Mail, User } from 'lucide-react';
import { useLogin, useRegister } from '../lib/hooks';

type TabType = 'login' | 'register';

export default function Login() {
  const [tab, setTab] = useState<TabType>('login');
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await loginMutation.mutateAsync(loginForm);
      // Redirect will happen via App component logic
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error || '登录失败，请重试');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await registerMutation.mutateAsync(registerForm);
      // Redirect will happen via App component logic
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error || '注册失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-xl mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Linheim 财务系统</h1>
          <p className="text-gray-500 mt-2">林海集团财务管理系统</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                tab === 'login'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                tab === 'register'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              注册
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="input-field pl-10"
                    placeholder="输入邮箱"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="input-field pl-10"
                    placeholder="输入密码"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loginMutation.isPending ? '登录中...' : '登录'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="input-field pl-10"
                    placeholder="输入姓名"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="input-field pl-10"
                    placeholder="输入邮箱"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="input-field pl-10"
                    placeholder="设置密码"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {registerMutation.isPending ? '注册中...' : '注册'}
              </button>
            </form>
          )}

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">🔐 测试账号</p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">邮箱:</span> admin@linheim.com
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">密码:</span> admin123
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2026 Linheim Group. All rights reserved.
        </p>
      </div>
    </div>
  );
}
