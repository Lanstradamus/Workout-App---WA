import { ReactNode, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from './AuthProvider';
import AuthModal from './AuthModal';

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuthContext();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 pb-20">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <h2 className="text-yellow-800 font-semibold mb-2">Sign in Required</h2>
          <p className="text-yellow-700 text-sm mb-4">
            Please sign in to access this page.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Sign In
          </button>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  return <>{children}</>;
}