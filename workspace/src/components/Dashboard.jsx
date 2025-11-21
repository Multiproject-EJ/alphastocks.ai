import { useAuth } from '../context/AuthContext.jsx';
import App from '../App.jsx';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      <App />
    </>
  );
};

export default Dashboard;
