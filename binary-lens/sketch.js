/**************************************
 *  p5.js ASCII Camera Sketch
 **************************************/

let params = {
  pixelSize: 4,   // default set to 4
  colour: [0, 0, 0],
  background: [255, 255, 255],
  characters: ' .:-=+*#%@',
  textSize: 10,   // default set to 10
  textStyle: 'NORMAL'
};

let capture;
let capturing = false;
let frontCam = false; // to toggle front/back
// Retrieve stored aspect ratio or default to "16:9"
let currentAspectRatio = localStorage.getItem('currentAspectRatio') || "16:9";

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Update the aspect ratio select element
  let aspectSelect = document.getElementById('aspectRatioSelect');
  if (aspectSelect) {
    aspectSelect.value = currentAspectRatio;
  }

  // Set default constraints (back camera) with the current aspect ratio
  let [arW, arH] = currentAspectRatio.split(':');
  let aspect = parseFloat(arW) / parseFloat(arH);
  let constraints = { facingMode: { exact: "environment" }, aspectRatio: aspect };
  initCamera(constraints);
  
  // For iOS inline playback
  if (capture) capture.elt.setAttribute('playsinline', '');
  
  // Orientation change listener (if needed)
  window.addEventListener('orientationchange', function() {
    // Additional orientation handling can be added here.
  });
}

function draw() {
  background(params.background);
  if (!capturing) return;

  let videoW = capture.elt.videoWidth;
  let videoH = capture.elt.videoHeight;
  if (videoW === 0 || videoH === 0) return;
  
  // Determine if vertical preview is desired
  let verticalPreview = (currentAspectRatio === "16:9" || currentAspectRatio === "4:5");
  
  // Compute aspect ratio from currentAspectRatio
  let [arW, arH] = currentAspectRatio.split(':');
  let aspect = parseFloat(arW) / parseFloat(arH);
  
  // For 16:9, invert ratio if vertical preview is desired
  if (currentAspectRatio === "16:9" && verticalPreview) {
    aspect = 1 / aspect; // becomes 9:16 (≈0.5625)
  }
  
  // Determine available drawing dimensions.
  let availW, availH;
  if (verticalPreview && windowWidth > windowHeight) {
    availW = windowHeight;
    availH = windowWidth;
  } else {
    availW = windowWidth;
    availH = windowHeight;
  }
  
  // Calculate container dimensions to cover the available area while maintaining aspect ratio.
  let containerWidth = availW;
  let containerHeight = availW / aspect;
  if (containerHeight > availH) {
    containerHeight = availH;
    containerWidth = availH * aspect;
  }
  
  // Determine scale factor for the video feed.
  let scaleFactor = max(containerWidth / videoW, containerHeight / videoH);
  let drawWidth = videoW * scaleFactor;
  let drawHeight = videoH * scaleFactor;
  let offsetX = (containerWidth - drawWidth) / 2;
  let offsetY = (containerHeight - drawHeight) / 2;
  
  push();
  // If in landscape with vertical preview, rotate canvas to display portrait
  if (verticalPreview && windowWidth > windowHeight) {
    translate(windowWidth, 0);
    rotate(PI / 2);
  }
  
  // Center the preview container in the available area.
  let drawX = (availW - containerWidth) / 2;
  let drawY = (availH - containerHeight) / 2;
  translate(drawX, drawY);
  
  // Center the video feed within the container.
  translate(offsetX, offsetY);
  scale(scaleFactor);
  
  // Mirror the drawn image if using the front camera.
  if (frontCam) {
    scale(-1, 1);
    translate(-videoW, 0);
  }
  
  capture.loadPixels();
  if (capture.pixels.length > 0) {
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
  }
  pop();
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
  // Instead of setting inline style, add the "showOverlay" class
  document.getElementById('mediaManagementOverlay').classList.add('showOverlay');
}

function deletePhoto() {
  document.getElementById('mediaManagementOverlay').classList.remove('showOverlay');
}

function savePhoto() {
  let link = document.createElement('a');
  let uniqueName = 'binaryLens-' + new Date().getTime() + '.png';
  link.download = uniqueName;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function sharePhoto() {
  let dataURL = document.getElementById('snapshotImg').src;
  fetch(dataURL)
    .then(res => res.blob())
    .then(blob => {
      const file = new File([blob], 'binaryLens-' + new Date().getTime() + '.png', { type: 'image/png' });
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
 *  Toggle Overlays
 **************************************/
function toggleASCIIControl() {
  const overlay = document.getElementById('asciiControlsOverlay');
  overlay.classList.toggle('showOverlay');
}

function toggleMediaManagementOverlay() {
  const overlay = document.getElementById('mediaManagementOverlay');
  overlay.classList.toggle('showOverlay');
}

/**************************************
 *  Close Overlay When Clicking Outside Modal
 **************************************/
// For ASCII Controls overlay
document.getElementById('asciiControlsOverlay').addEventListener('click', function(e) {
  if (e.target === this) {
    this.classList.remove('showOverlay');
  }
});

// For Media Management overlay
document.getElementById('mediaManagementOverlay').addEventListener('click', function(e) {
  if (e.target === this) {
    this.classList.remove('showOverlay');
  }
});

/**************************************
 *  Aspect Ratio
 **************************************/
function handleAspectRatioChange() {
  let select = document.getElementById('aspectRatioSelect');
  currentAspectRatio = select.value;
  localStorage.setItem('currentAspectRatio', currentAspectRatio);
  let [arW, arH] = currentAspectRatio.split(':');
  let aspect = parseFloat(arW) / parseFloat(arH);
  let constraints = {
    facingMode: frontCam ? "user" : { exact: "environment" },
    aspectRatio: aspect
  };
  initCamera(constraints);
}

/**************************************
 *  Pixel Size Controls
 **************************************/
function adjustPixelSize(delta) {
  let slider = document.getElementById('pixelSizeRange');
  let val = parseInt(slider.value) + delta;
  val = constrain(val, 1, 32);
  slider.value = val;
  updatePixelSize(val);
}

function updatePixelSize(newVal) {
  let val = parseInt(newVal);
  val = constrain(val, 1, 32);
  params.pixelSize = val;
  document.getElementById('pixelSizeValue').textContent = val;
}

/**************************************
 *  Text Size Controls
 **************************************/
function adjustTextSize(delta) {
  let slider = document.getElementById('textSizeRange');
  let val = parseInt(slider.value) + delta;
  val = constrain(val, 1, 32);
  slider.value = val;
  updateTextSize(val);
}

function updateTextSize(newVal) {
  let val = parseInt(newVal);
  val = constrain(val, 1, 32);
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
 *  Color Controls
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
