import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (import.meta.env.PROD) {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((error) => {
        console.error('WeatherBoard service worker registration failed:', error);
      });
      return;
    }

    navigator.serviceWorker.getRegistration().then((registration) => {
      const expectedWorkerUrl = new URL(`${import.meta.env.BASE_URL}sw.js`, window.location.href).href;
      if (registration?.active?.scriptURL === expectedWorkerUrl) {
        return registration.unregister().then((wasUnregistered) => {
          if (wasUnregistered) window.location.reload();
        });
      }
      return undefined;
    }).catch((error) => {
      console.error('WeatherBoard development service worker cleanup failed:', error);
    });
  });
}
