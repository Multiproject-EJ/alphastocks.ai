import { render } from 'preact';
import { AuthProvider } from './context/AuthContext.jsx';
import Router from './components/Router.jsx';
import './styles/app.css';

const root = document.getElementById('root');

render(
  <AuthProvider>
    <Router />
  </AuthProvider>,
  root
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker registration failed', error);
    });
  });
}
