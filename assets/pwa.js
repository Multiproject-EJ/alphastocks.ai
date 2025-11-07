(function () {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const INSTALL_STORAGE_KEY = 'alphastocksPwaInstalled';
  const installButton = document.querySelector('[data-pwa-install]');
  let deferredPrompt = null;

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

  const hideInstallButton = () => {
    if (!installButton) return;
    installButton.setAttribute('hidden', '');
    installButton.classList.remove('is-visible');
  };

  const showInstallButton = () => {
    if (!installButton) return;
    installButton.classList.add('is-visible');
    installButton.removeAttribute('hidden');
    installButton.disabled = false;
  };

  const registerServiceWorker = () => {
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
    if (!installButton) {
      return;
    }
    showInstallButton();

    const clickHandler = async () => {
      installButton.disabled = true;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallFlag('1');
      }
      deferredPrompt = null;
      hideInstallButton();
    };

    installButton.addEventListener('click', clickHandler, { once: true });
  });

  window.addEventListener('appinstalled', () => {
    setInstallFlag('1');
    deferredPrompt = null;
    hideInstallButton();
  });

  if (installButton) {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone || hasInstallFlag()) {
      hideInstallButton();
    }
  }
})();
