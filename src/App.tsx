import { AuthProvider, useAuth } from './context/AuthContext';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';

function AppContent() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen">
      {isLoggedIn ? <Dashboard /> : <Login />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
