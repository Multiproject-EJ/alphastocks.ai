(function () {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  // Guard service worker registration behind ENABLE_SW flag to prevent stale cache issues
  const ENABLE_SW = window.__ENV__?.ENABLE_SW === true;

  const INSTALL_STORAGE_KEY = 'alphastocksPwaInstalled';
  let deferredPrompt = null;

  const ensureInstallButtons = () => {
    const buttons = Array.from(document.querySelectorAll('[data-pwa-install]'));
    if (buttons.length || !document.body) {
      return buttons;
    }

    const fab = document.createElement('button');
    fab.type = 'button';
    fab.dataset.pwaInstall = 'fab';
    fab.className = 'btn-primary pwa-fab';
    fab.setAttribute('aria-label', 'Install AlphaStocks workspace');
    fab.textContent = 'Install app';
    fab.setAttribute('hidden', '');
    document.body.appendChild(fab);
    return [fab];
  };

  const installButtons = ensureInstallButtons();
  let installListenersBound = false;

  const setInstallFlag = (value) => {
    try {
      if (value) {
        localStorage.setItem(INSTALL_STORAGE_KEY, value);
      } else {
        localStorage.removeItem(INSTALL_STORAGE_KEY);
      }
    } catch (error) {
      console.debug('Unable to persist install flag', error);
    }
  };

  const hasInstallFlag = () => {
    try {
      return localStorage.getItem(INSTALL_STORAGE_KEY);
    } catch (error) {
      return null;
    }
  };

  const hideInstallButtons = () => {
    installButtons.forEach((button) => {
      button.setAttribute('hidden', '');
      button.classList.remove('is-visible');
      button.disabled = false;
    });
  };

  const showInstallButtons = () => {
    installButtons.forEach((button) => {
      button.classList.add('is-visible');
      button.removeAttribute('hidden');
      button.disabled = false;
    });
  };

  const onInstallClick = async (event) => {
    if (!deferredPrompt) {
      return;
    }
    event.preventDefault();
    const target = event.currentTarget;
    if (target) {
      target.disabled = true;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallFlag('1');
    }
    deferredPrompt = null;
    hideInstallButtons();
    toggleInstallListeners(false);
  };

  const toggleInstallListeners = (enable) => {
    if (!installButtons.length) {
      return;
    }
    installButtons.forEach((button) => {
      const method = enable ? 'addEventListener' : 'removeEventListener';
      button[method]('click', onInstallClick);
    });
    installListenersBound = enable;
  };

  const registerServiceWorker = () => {
    if (!ENABLE_SW) {
      console.debug('[PWA] Service worker registration disabled (ENABLE_SW is false)');
      return;
    }
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((error) => console.error('Service worker registration failed', error));
  };

  if (document.readyState === 'complete') {
    registerServiceWorker();
  } else {
    window.addEventListener('load', registerServiceWorker);
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    deferredPrompt = event;
    event.preventDefault();
    if (!installButtons.length) {
      return;
    }
    showInstallButtons();
    if (!installListenersBound) {
      toggleInstallListeners(true);
    }
  });

  window.addEventListener('appinstalled', () => {
    setInstallFlag('1');
    deferredPrompt = null;
    hideInstallButtons();
    toggleInstallListeners(false);
  });

  if (installButtons.length) {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone || hasInstallFlag()) {
      hideInstallButtons();
    }
  }
})();
