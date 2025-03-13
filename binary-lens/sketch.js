/**************************************
 *  p5.js ASCII Camera Sketch
 **************************************/

let params = {
  pixelSize: 10,
  colour: [0, 0, 0],
  background: [255, 255, 255],
  characters: ' .:-=+*#%@',
  textSize: 13,
  textStyle: 'NORMAL'
};

let capture;
let capturing = false;
let frontCam = false; // to toggle front/back
let currentAspectRatio = "16:9"; // track user's chosen aspect ratio

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Default constraints (back camera)
  initCamera({ facingMode: { exact: "environment" } });
  
  // For iOS inline playback
  if (capture) capture.elt.setAttribute('playsinline', '');
}

function draw() {
  background(params.background);
  if (!capturing) return;

  let videoW = capture.elt.videoWidth;
  let videoH = capture.elt.videoHeight;
  if (videoW === 0 || videoH === 0) return;
  
  // "Cover" logic to fill entire canvas while preserving aspect ratio
  let scaleFactor = max(width / videoW, height / videoH);
  let drawWidth = videoW * scaleFactor;
  let drawHeight = videoH * scaleFactor;
  let offsetX = (width - drawWidth) / 2;
  let offsetY = (height - drawHeight) / 2;

  capture.loadPixels();
  if (capture.pixels.length > 0) {
    push();
    translate(offsetX, offsetY);
    scale(scaleFactor);

    // Apply text style
    if (params.textStyle === 'BOLD') {
      textStyle(BOLD);
    } else if (params.textStyle === 'ITALIC') {
      textStyle(ITALIC);
    } else {
      textStyle(NORMAL);
    }
    fill(params.colour);
    textSize(params.textSize);

    let chars = params.characters.split('');
    for (let y = 0; y < videoH; y += params.pixelSize) {
      for (let x = 0; x < videoW; x += params.pixelSize) {
        let index = (x + y * videoW) * 4;
        let r = capture.pixels[index + 0];
        let g = capture.pixels[index + 1];
        let b = capture.pixels[index + 2];

        let bright = (r + g + b) / 3;
        let charIndex = floor(map(bright, 0, 255, chars.length - 1, 0));
        text(chars[charIndex], x, y);
      }
    }
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/**************************************
 *  Camera Initialization
 **************************************/
function initCamera(videoConstraints) {
  if (capture) {
    capture.remove();
  }
  let constraints = {
    video: videoConstraints,
    audio: false
  };
  
  capture = createCapture(constraints, () => {
    capturing = true;
    console.log("Camera initialized:", constraints);
  });
  capture.hide();
}

/**************************************
 *  Switch Camera
 **************************************/
function switchCamera() {
  frontCam = !frontCam;

  let [arW, arH] = currentAspectRatio.split(':');
  let aspect = parseFloat(arW) / parseFloat(arH);

  let constraints = {
    facingMode: frontCam ? "user" : { exact: "environment" },
    aspectRatio: aspect
  };
  initCamera(constraints);
}

/**************************************
 *  Snapshot + Media Management
 **************************************/
function takeSnapshot() {
  let snapshotDataURL = canvas.toDataURL('image/png');
  let img = document.getElementById('snapshotImg');
  img.src = snapshotDataURL;
  document.getElementById('mediaManagementOverlay').style.display = 'block';
}

function deletePhoto() {
  document.getElementById('mediaManagementOverlay').style.display = 'none';
}

function savePhoto() {
  let link = document.createElement('a');
  let imgSrc = document.getElementById('snapshotImg').src;
  link.download = 'ascii-photo.png';
  link.href = imgSrc;
  link.click();
}

function sharePhoto() {
  let dataURL = document.getElementById('snapshotImg').src;
  fetch(dataURL)
    .then(res => res.blob())
    .then(blob => {
      const file = new File([blob], 'ascii-photo.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: 'My ASCII Photo',
          text: 'Check out this ASCII image!'
        }).catch(err => console.error(err));
      } else {
        alert('Sharing not supported on this browser.');
      }
    });
}

/**************************************
 *  ASCII Controls Overlay
 **************************************/
function toggleASCIIControl() {
  let overlay = document.getElementById('asciiControlsOverlay');
  overlay.style.display = (overlay.style.display === 'none' || overlay.style.display === '')
    ? 'block'
    : 'none';
}

/**************************************
 *  Aspect Ratio
 **************************************/
function handleAspectRatioChange() {
  let select = document.getElementById('aspectRatioSelect');
  currentAspectRatio = select.value; // e.g. "16:9"

  let [arW, arH] = currentAspectRatio.split(':');
  let aspect = parseFloat(arW) / parseFloat(arH);

  let constraints = {
    facingMode: frontCam ? "user" : { exact: "environment" },
    aspectRatio: aspect
  };
  initCamera(constraints);
}

/**************************************
 *  pixelSize with Carets + Range
 **************************************/
function adjustPixelSize(delta) {
  let slider = document.getElementById('pixelSizeRange');
  let val = parseInt(slider.value) + delta;
  val = constrain(val, 1, 64); // p5.js has constrain()
  slider.value = val;
  updatePixelSize(val);
}

function updatePixelSize(newVal) {
  let val = parseInt(newVal);
  val = constrain(val, 1, 64);
  params.pixelSize = val;
  document.getElementById('pixelSizeValue').textContent = val;
}

/**************************************
 *  textSize with Carets + Range
 **************************************/
function adjustTextSize(delta) {
  let slider = document.getElementById('textSizeRange');
  let val = parseInt(slider.value) + delta;
  val = constrain(val, 1, 64);
  slider.value = val;
  updateTextSize(val);
}

function updateTextSize(newVal) {
  let val = parseInt(newVal);
  val = constrain(val, 1, 64);
  params.textSize = val;
  document.getElementById('textSizeValue').textContent = val;
}

/**************************************
 *  Character Set
 **************************************/
function handleCharacterSetChange() {
  let select = document.getElementById('characterSetSelect');
  let customInput = document.getElementById('customCharacterSet');
  
  if (select.value === 'default') {
    params.characters = ' .:-=+*#%@';
    customInput.style.display = 'none';
  } else if (select.value === 'asciiLetters') {
    params.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    customInput.style.display = 'none';
  } else if (select.value === 'custom') {
    customInput.style.display = 'inline-block';
    params.characters = customInput.value;
  }
}

function handleCustomCharacters() {
  let customInput = document.getElementById('customCharacterSet');
  params.characters = customInput.value;
}

/**************************************
 *  Text Style
 **************************************/
function handleTextStyleChange() {
  let styleSelect = document.getElementById('textStyleSelect');
  params.textStyle = styleSelect.value; 
}

/**************************************
 *  Text/Background Color
 **************************************/
function handleTextColorChange() {
  let colorInput = document.getElementById('textColorInput');
  params.colour = hexToRGBArray(colorInput.value);
}

function handleBackgroundColorChange() {
  let colorInput = document.getElementById('backgroundColorInput');
  params.background = hexToRGBArray(colorInput.value);
}

function hexToRGBArray(hex) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}
