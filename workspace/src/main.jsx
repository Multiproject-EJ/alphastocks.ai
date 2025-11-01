import { render } from 'preact';
import App from './App.jsx';
import './styles/app.css';

const root = document.getElementById('root');

render(<App />, root);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker registration failed', error);
    });
  });
}
