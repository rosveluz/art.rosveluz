import HomeScreen from './components/homeScreen.js';
import ListeningScreen from './components/listeningScreen.js';
import InfoModal from './components/infoModal.js';

const screens = {
  home: HomeScreen,
  listening: ListeningScreen
};

const app = document.getElementById('app');
let current = null;

export function goTo(screen, options = {}) {
  if (current && typeof current.cleanup === 'function') {
    current.cleanup();
  }
  app.innerHTML = '';
  const ScreenClass = screens[screen];
  current = new ScreenClass(app, {
    ...options,
    onNext: goTo,
    onInfo: showInfoModal
  });
}

let infoModal = null;
function showInfoModal() {
  // Always recreate the modal on each click
  if (infoModal) {
    infoModal.hide();
    infoModal = null;
  }
  infoModal = new InfoModal(document.body, {
    onClose: () => { infoModal = null; }
  });
  infoModal.show();
}

// Wire up global header buttons once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const headerLogo = document.getElementById('homeBtn');
  if (headerLogo) {
    headerLogo.addEventListener('click', () => goTo('home'));
  }
  const headerInfoBtn = document.getElementById('infoBtn');
  if (headerInfoBtn) {
    headerInfoBtn.addEventListener('click', showInfoModal);
  }
});

// Start at home screen
goTo('home');