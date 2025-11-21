import { useAuth } from '../context/AuthContext.jsx';
import App from '../App.jsx';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <App user={user} onSignOut={handleSignOut} />
    </>
  );
};

export default Dashboard;
