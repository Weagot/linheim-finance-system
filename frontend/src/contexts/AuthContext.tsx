import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  // 演示模式（无后端时使用）
  demoLogin: () => void;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 演示用户
const DEMO_USER: User = {
  id: 'demo-user',
  name: '演示用户',
  email: 'demo@linheim.com',
  role: 'ADMIN',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // 初始化时检查登录状态
  useEffect(() => {
    const initAuth = async () => {
      // 检查是否是演示模式
      const demoMode = localStorage.getItem('demo_mode');
      if (demoMode === 'true') {
        setUser(DEMO_USER);
        setIsDemo(true);
        setIsLoading(false);
        return;
      }

      // 检查是否有 token
      const token = authApi.getToken();
      if (token) {
        try {
          const { user: currentUser } = await authApi.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Token 无效，清除
          authApi.logout();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { user: loggedInUser } = await authApi.login(email, password);
    setUser(loggedInUser);
    setIsDemo(false);
    localStorage.removeItem('demo_mode');
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setIsDemo(false);
    localStorage.removeItem('demo_mode');
  };

  const demoLogin = () => {
    setUser(DEMO_USER);
    setIsDemo(true);
    localStorage.setItem('demo_mode', 'true');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        demoLogin,
        isDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
