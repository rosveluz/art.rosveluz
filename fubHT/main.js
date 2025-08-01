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

// Show InfoModal with custom HTML content
function showInfo() {
  if (!modal) {
    modal = new InfoModal(document.body, {
      onClose: () => modal.hide(),
      content: `
        <h3>About Oro-Plata-Mata</h3>
        <p>“Oro, Plata, Mata” counts steps in threes. Ending on “Mata” (death) is avoided.</p>
        <p>This superstition guides the design to end on “Oro” or “Plata,” not “Mata.”</p>
      `
    });
  }
  modal.show();
}

function attachHeaderListeners() {
  // Home button: navigate to HomeScreen
  const homeBtn = document.getElementById('homeBtn');
  if (homeBtn) homeBtn.addEventListener('click', () => goTo(HomeScreen));

  const infoBtn = document.getElementById('infoBtn');
  if (infoBtn) infoBtn.addEventListener('click', showInfo);
  const closeBtn = document.getElementById('closeBtn');
  if (closeBtn) closeBtn.addEventListener('click', () => modal && modal.hide());
}

goTo(HomeScreen);