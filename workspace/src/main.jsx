import { render } from 'preact';
import { AuthProvider } from './context/AuthContext.jsx';
import Router from './components/Router.jsx';
import './styles/app.css';

const root = document.getElementById('root') ?? (() => {
  const fallbackRoot = document.createElement('div');
  fallbackRoot.id = 'root';
  document.body.appendChild(fallbackRoot);
  console.warn('Missing #root mount node. Injected a fallback root container.');
  return fallbackRoot;
})();

render(
  <AuthProvider>
    <Router />
  </AuthProvider>,
  root
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker registration failed', error);
    });
  });
}
