const body = document.body;
const yearEl = document.getElementById('year');
const themeToggle = document.getElementById('themeToggle');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const landingSection = document.getElementById('landing');
const appSection = document.getElementById('app');
const appUser = document.getElementById('appUser');
const userGreeting = document.getElementById('userGreeting');
const logoutButton = document.getElementById('logout');
const menuItems = document.querySelectorAll('.menu-item');
const detailViews = document.querySelectorAll('.detail-view');
const tabs = document.querySelectorAll('.tab');
const submenuItems = document.querySelectorAll('.submenu-item');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const setThemeToggleCopy = (theme) => {
  if (!themeToggle) return;
  const label = theme === 'dark' ? 'Switch to light' : 'Switch to dark';
  themeToggle.textContent = label;
  themeToggle.setAttribute('aria-pressed', theme === 'light');
};

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = body.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', next);
    setThemeToggleCopy(next);
  });
  setThemeToggleCopy(body.getAttribute('data-theme') || 'dark');
}

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

const showApp = (email) => {
  landingSection?.classList.add('hidden');
  landingSection?.setAttribute('aria-hidden', 'true');
  appSection?.classList.remove('hidden');
  appSection?.setAttribute('aria-hidden', 'false');
  if (appUser) {
    appUser.textContent = email;
  }
  if (userGreeting) {
    const name = email.split('@')[0] || 'trader';
    userGreeting.textContent = `Welcome, ${name}.`;
  }
  resetWorkspaceState();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const showLanding = () => {
  landingSection?.classList.remove('hidden');
  landingSection?.setAttribute('aria-hidden', 'false');
  appSection?.classList.add('hidden');
  appSection?.setAttribute('aria-hidden', 'true');
};

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = loginEmail?.value.trim();
    const password = loginPassword?.value.trim();

    if (!email || !password) {
      if (loginError) {
        loginError.textContent = 'Enter an email and password to continue.';
      }
      return;
    }

    if (loginError) {
      loginError.textContent = '';
    }

    showApp(email.toLowerCase());
    loginForm.reset();
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    showLanding();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

resetWorkspaceState();
activateSubsection('portfolio-results');
