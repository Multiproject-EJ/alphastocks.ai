const body = document.body;
const yearEl = document.getElementById('year');
const themeToggle = document.getElementById('themeToggle');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const signupName = document.getElementById('signupName');
const authOverlay = document.getElementById('authOverlay');
const authHeading = document.getElementById('authHeading');
const authSubtext = document.getElementById('authSubtext');
const authSubmit = document.getElementById('authSubmit');
const authModeButtons = document.querySelectorAll('[data-auth-mode]');
const appUser = document.getElementById('appUser');
const userGreeting = document.getElementById('userGreeting');
const logoutButton = document.getElementById('logout');
const menuItems = document.querySelectorAll('.menu-item[data-section]');
const detailViews = document.querySelectorAll('.detail-view');
const tabs = document.querySelectorAll('.tab');
const submenuItems = document.querySelectorAll('.submenu-item');
const valuebotTabs = document.querySelectorAll('.valuebot-tab');
const valuebotViews = document.querySelectorAll('.valuebot-view');
const constructionOverlay = document.getElementById('constructionOverlay');
const constructionContinue = document.getElementById('constructionContinue');
const dialogTriggers = document.querySelectorAll('[data-dialog-target]');
const dialogCloseButtons = document.querySelectorAll('[data-dialog-close]');

const CONSTRUCTION_STORAGE_KEY = 'alphaConstructionDismissed';
const THEME_STORAGE_KEY = 'alphastocksTheme';
const themeMeta = document.querySelector('meta[name="theme-color"]');
const DIALOG_TRANSITION_MS = 320;
let activeDialog = null;
let lastDialogTrigger = null;
const dialogHideTimers = new Map();

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const setThemeToggleCopy = (theme) => {
  if (!themeToggle) return;
  const label = theme === 'dark' ? 'Switch to light' : 'Switch to dark';
  themeToggle.textContent = label;
  themeToggle.setAttribute('aria-pressed', theme === 'light');
};

const setThemeMetaColor = (theme) => {
  if (!themeMeta) return;
  const color = theme === 'dark' ? '#0B1120' : '#f5f7fb';
  themeMeta.setAttribute('content', color);
};

const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const storedTheme = (() => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    return null;
  }
})();

const initialTheme = storedTheme || body.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
body.setAttribute('data-theme', initialTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = body.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', next);
    setThemeToggleCopy(next);
    setThemeMetaColor(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (error) {
      console.debug('Unable to persist theme preference', error);
    }
  });
  setThemeToggleCopy(initialTheme);
}

setThemeMetaColor(initialTheme);

const openDialog = (dialog) => {
  if (!dialog) return;
  if (activeDialog === dialog) {
    return;
  }
  const pendingTimer = dialogHideTimers.get(dialog);
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    dialogHideTimers.delete(dialog);
  }
  dialog.removeAttribute('hidden');
  dialog.setAttribute('aria-hidden', 'false');
  window.requestAnimationFrame(() => {
    dialog.classList.add('visible');
  });
  const focusTarget =
    dialog.querySelector('[data-dialog-initial-focus]') ||
    dialog.querySelector('button, [href], input, select, textarea');
  if (focusTarget) {
    window.setTimeout(() => {
      focusTarget.focus({ preventScroll: true });
    }, 0);
  }
  activeDialog = dialog;
  body.classList.add('dialog-open');
};

const closeDialog = (dialog, { restoreFocus = true } = {}) => {
  if (!dialog) return;
  dialog.classList.remove('visible');
  dialog.setAttribute('aria-hidden', 'true');
  const hideTimer = window.setTimeout(() => {
    dialog.setAttribute('hidden', 'true');
    dialogHideTimers.delete(dialog);
  }, DIALOG_TRANSITION_MS);
  dialogHideTimers.set(dialog, hideTimer);
  if (activeDialog === dialog) {
    activeDialog = null;
  }
  const hasOtherVisibleDialog = document.querySelector('.app-dialog.visible');
  if (!hasOtherVisibleDialog) {
    body.classList.remove('dialog-open');
  }
  if (restoreFocus && lastDialogTrigger) {
    lastDialogTrigger.focus({ preventScroll: true });
    lastDialogTrigger = null;
  }
};

dialogTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const targetId = trigger.getAttribute('data-dialog-target');
    if (!targetId) return;
    const dialog = document.getElementById(targetId);
    if (!dialog) return;
    if (activeDialog && activeDialog !== dialog) {
      closeDialog(activeDialog, { restoreFocus: false });
    }
    lastDialogTrigger = trigger;
    openDialog(dialog);
  });
});

dialogCloseButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const dialog = button.closest('.app-dialog');
    closeDialog(dialog);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && activeDialog) {
    closeDialog(activeDialog);
  }
});

const showSection = (id) => {
  detailViews.forEach((view) => {
    view.classList.toggle('visible', view.id === id);
  });
};

const activateMenuItem = (item) => {
  menuItems.forEach((el) => el.classList.remove('active'));
  item.classList.add('active');
  showSection(item.dataset.section);
};

menuItems.forEach((item) => {
  item.addEventListener('click', () => {
    activateMenuItem(item);
    if (item.dataset.section === 'portfolio') {
      activateSubsection('portfolio-results');
    }
  });
});

const activateSubsection = (subId) => {
  submenuItems.forEach((sub) => sub.classList.toggle('active', sub.dataset.sub === subId));
  const portfolioView = document.getElementById('portfolio');
  if (!portfolioView) return;
  const cards = portfolioView.querySelectorAll('[data-subtarget]');
  cards.forEach((card) => {
    const match = card.getAttribute('data-subtarget') === subId;
    card.classList.toggle('highlight', match);
  });
};

submenuItems.forEach((item) => {
  item.addEventListener('click', (event) => {
    event.stopPropagation();
    const parentMenu = document.querySelector(`.menu-item[data-section="portfolio"]`);
    if (parentMenu) {
      activateMenuItem(parentMenu);
    }
    activateSubsection(item.dataset.sub);
  });
});

if (tabs.length) {
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
}

const setValuebotView = (targetId) => {
  if (!valuebotViews.length) return;
  valuebotViews.forEach((view) => {
    view.classList.toggle('active', view.id === targetId);
  });
};

if (valuebotTabs.length) {
  valuebotTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      valuebotTabs.forEach((btn) => btn.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.target || valuebotViews[index]?.id;
      if (target) {
        setValuebotView(target);
      }
    });
  });
  const defaultTarget = valuebotTabs[0]?.dataset.target || valuebotViews[0]?.id;
  if (defaultTarget) {
    setValuebotView(defaultTarget);
  }
}

const resetWorkspaceState = () => {
  const defaultMenu = document.querySelector('.menu-item[data-section="dashboard"]');
  if (defaultMenu) {
    activateMenuItem(defaultMenu);
  }
  activateSubsection('portfolio-results');
  tabs.forEach((t, index) => {
    t.classList.toggle('active', index === 0);
  });
};

const setAuthMode = (mode) => {
  if (!loginForm) return;
  loginForm.setAttribute('data-mode', mode);
  authModeButtons.forEach((button) => {
    const isActive = (button.dataset.authMode || 'signin') === mode;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  });
  if (authHeading) {
    authHeading.textContent = mode === 'signup' ? 'Create your workspace access' : 'Welcome back';
  }
  if (authSubtext) {
    authSubtext.textContent = mode === 'signup'
      ? 'Sign up with an email to unlock the live workspace preview.'
      : 'Use the demo credentials or your email to step inside the workspace.';
  }
  if (authSubmit) {
    authSubmit.textContent = mode === 'signup' ? 'Create account' : 'Enter workspace';
  }
  if (loginError) {
    loginError.textContent = '';
  }
};

const initializeAuthState = () => {
  if (body.classList.contains('construction-gate')) {
    return;
  }
  if (body.classList.contains('auth-required')) {
    showOverlay();
  } else {
    setAuthMode(loginForm?.getAttribute('data-mode') || 'signin');
  }
};

authModeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setAuthMode(button.dataset.authMode || 'signin');
  });
});

const showApp = (email, name) => {
  body.classList.remove('auth-required');
  authOverlay?.setAttribute('aria-hidden', 'true');
  if (appUser) {
    appUser.textContent = email;
  }
  if (userGreeting) {
    const fallback = email.split('@')[0] || 'trader';
    const displayName = name || fallback;
    userGreeting.textContent = `Welcome, ${displayName}.`;
  }
  resetWorkspaceState();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const showOverlay = () => {
  body.classList.add('auth-required');
  authOverlay?.setAttribute('aria-hidden', 'false');
  setAuthMode('signin');
  loginForm?.reset();
  window.setTimeout(() => {
    loginEmail?.focus();
  }, 0);
};

const showConstructionGate = () => {
  body.classList.add('construction-gate');
  constructionOverlay?.setAttribute('aria-hidden', 'false');
  authOverlay?.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => {
    constructionContinue?.focus();
  }, 0);
};

const hideConstructionGate = () => {
  body.classList.remove('construction-gate');
  constructionOverlay?.setAttribute('aria-hidden', 'true');
};

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = loginEmail?.value.trim();
    const password = loginPassword?.value.trim();
    const mode = loginForm.getAttribute('data-mode') || 'signin';
    const name = signupName?.value.trim();

    if (!email || !password) {
      if (loginError) {
        loginError.textContent = 'Enter an email and password to continue.';
      }
      return;
    }

    if (loginError) {
      loginError.textContent = '';
    }

    showApp(email.toLowerCase(), mode === 'signup' ? name : undefined);
    loginForm.reset();
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    showOverlay();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

resetWorkspaceState();
activateSubsection('portfolio-results');

// AI Analysis logic has been moved to assets/ai-analysis.js module

// Construction gate - check environment variable for gate display
const showConstructionGateFlag = (() => {
  // Check for SHOW_CONSTRUCTION_GATE environment flag via window.__ENV__
  const env = window.__ENV__ || {};
  return env.SHOW_CONSTRUCTION_GATE === true || env.SHOW_CONSTRUCTION_GATE === 'true';
})();

const hasDismissedConstruction = sessionStorage.getItem(CONSTRUCTION_STORAGE_KEY) === 'true';

if (showConstructionGateFlag && !hasDismissedConstruction) {
  showConstructionGate();
} else {
  hideConstructionGate();
  initializeAuthState();
}

constructionContinue?.addEventListener('click', (event) => {
  event.preventDefault();
  sessionStorage.setItem(CONSTRUCTION_STORAGE_KEY, 'true');
  hideConstructionGate();
  initializeAuthState();
});
