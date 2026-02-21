import { useCurrentUser } from '../lib/hooks';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show login page (handled by App component)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
