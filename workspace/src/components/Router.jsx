import { useState } from 'preact/hooks';
import { useAuth } from '../context/AuthContext.jsx';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import Dashboard from './Dashboard.jsx';

const Router = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show dashboard
  if (user) {
    return <Dashboard />;
  }

  // If user is not authenticated, show login or signup
  if (authMode === 'signup') {
    return <Signup onToggleMode={() => setAuthMode('login')} />;
  }

  return <Login onToggleMode={() => setAuthMode('signup')} />;
};

export default Router;
