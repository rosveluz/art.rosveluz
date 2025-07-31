import HomeScreen from './components/homeScreen.js';
import SessionScreen from './components/sessionScreen.js';
import ListeningScreen from './components/listeningScreen.js';
import InfoModal from './components/infoModal.js';

const app = document.getElementById('app');
let modal;

function goTo(Screen) {
  app.innerHTML = '';
  new Screen(app, { onNext: handleNext });
  attachHeaderListeners();
}

function handleNext(screenName) {
  switch (screenName) {
    case 'session':
      goTo(SessionScreen);
      break;
    case 'listening':
      goTo(ListeningScreen);
      break;
    default:
      goTo(HomeScreen);
  }
}

function showInfo() {
  if (!modal) {
    modal = new InfoModal(document.body, { onClose: () => modal.hide() });
  }
  modal.show();
}

function attachHeaderListeners() {
  const infoBtn = document.getElementById('infoBtn');
  const closeBtn = document.getElementById('closeBtn');
  if (infoBtn) infoBtn.addEventListener('click', showInfo);
  if (closeBtn) closeBtn.addEventListener('click', () => modal && modal.hide());
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}

goTo(HomeScreen);