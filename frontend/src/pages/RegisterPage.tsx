import { Mail, Lock, User, ArrowRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useRegister } from '../lib/hooks';
import { useToast } from '../contexts/ToastContext';
import { useState } from 'react';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<{
    name: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
  }>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const registerMutation = useRegister();
  const toast = useToast();

  const errors = {
    name: touched.name && !formData.name ? '请输入姓名' : '',
    email: touched.email && !formData.email ? '请输入邮箱地址' : '',
    emailInvalid: touched.email && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? '请输入有效的邮箱地址' : '',
    password: touched.password && !formData.password ? '请输入密码' : '',
    passwordShort: touched.password && formData.password && formData.password.length < 6 ? '密码至少需要6个字符' : '',
    confirmPassword: touched.confirmPassword && !formData.confirmPassword ? '请确认密码' : '',
    passwordMismatch: touched.confirmPassword && formData.confirmPassword && formData.password !== formData.confirmPassword ? '两次输入的密码不一致' : '',
  };

  const hasErrors = Object.values(errors).some((e) => e !== '');

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (hasErrors) {
      toast.show('请检查输入信息', 'warning');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      toast.show('注册成功！正在跳转...', 'success');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '注册失败，请稍后重试';
      toast.show(errorMessage, 'error', 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Left Side - Info */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 lg:p-12 text-white">
            <div className="mb-8">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl">🏢</span>
              </div>
              <h2 className="text-3xl font-bold mb-3">创建您的账户</h2>
              <p className="text-blue-100">
                加入 Linheim 财务系统，开启高效的财务管理之旅
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">免费使用，无需信用卡</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">企业级安全保障</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">7×24小时技术支持</span>
              </div>
            </div>

            <div className="mt-12">
              <p className="text-sm text-blue-200">
                已有账户？
                <a
                  href="#login"
                  className="text-white font-medium ml-1 hover:underline"
                >
                  立即登录
                </a>
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 lg:p-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">注册新账户</h3>
              <p className="text-gray-600">填写以下信息创建您的账户</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  姓名
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onBlur={() => handleBlur('name')}
                    className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                      touched.name && errors.name
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } focus:ring-2 focus:ring-opacity-20 transition-all outline-none`}
                    placeholder="请输入您的姓名"
                    autoComplete="name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱地址
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onBlur={() => handleBlur('email')}
                    className={`w-full pl-12 pr-4 py-3 rounded-lg border ${
                      touched.email && (errors.email || errors.emailInvalid)
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } focus:ring-2 focus:ring-opacity-20 transition-all outline-none`}
                    placeholder="name@company.com"
                    autoComplete="email"
                  />
                </div>
                {(errors.email || errors.emailInvalid) && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email || errors.emailInvalid}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onBlur={() => handleBlur('password')}
                    className={`w-full pl-12 pr-12 py-3 rounded-lg border ${
                      touched.password && (errors.password || errors.passwordShort)
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } focus:ring-2 focus:ring-opacity-20 transition-all outline-none`}
                    placeholder="至少6个字符"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  </button>
                </div>
                {(errors.password || errors.passwordShort) && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password || errors.passwordShort}
                  </p>
                )}
                <p className="mt-1.5 text-xs text-gray-500">
                  密码长度至少6个字符，建议使用字母、数字和符号的组合
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  确认密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`w-full pl-12 pr-12 py-3 rounded-lg border ${
                      touched.confirmPassword && (errors.confirmPassword || errors.passwordMismatch)
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } focus:ring-2 focus:ring-opacity-20 transition-all outline-none`}
                    placeholder="再次输入密码"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  </button>
                </div>
                {(errors.confirmPassword || errors.passwordMismatch) && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword || errors.passwordMismatch}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 focus:ring-opacity-20"
                  />
                </div>
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  我已阅读并同意
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                    服务条款
                  </a>
                  和
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                    隐私政策
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {registerMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>注册中...</span>
                  </>
                ) : (
                  <>
                    <span>创建账户</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-gray-600 mt-8">
              已有账户？
              <a
                href="#login"
                className="text-blue-600 hover:text-blue-700 font-medium ml-1"
              >
                立即登录
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          © 2026 Linheim Group. All rights reserved.
        </p>
      </div>
    </div>
  );
}
