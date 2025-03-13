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
let currentAspectRatio = "16:9"; // track user's chosen aspect ratio

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Default constraints (back camera)
  initCamera({ facingMode: { exact: "environment" } });
  
  // For iOS inline playback
  if (capture) capture.elt.setAttribute('playsinline', '');
  
  // Listen for orientation changes to adjust if needed (for front camera)
  window.addEventListener('orientationchange', function() {
    // You can add further orientation handling here if needed.
  });
}

// Modified draw() function for vertical preview when 16:9 or 4:5 is selected.
// Also, if using the front camera, the drawn content is mirrored.
function draw() {
  background(params.background);
  if (!capturing) return;

  let videoW = capture.elt.videoWidth;
  let videoH = capture.elt.videoHeight;
  if (videoW === 0 || videoH === 0) return;
  
  // Determine if vertical preview is desired for these aspect ratios.
  // For 16:9 we want to display it vertically (i.e. 9:16) so that the landscape width is fully used.
  // For 4:5 the ratio (0.8) is already vertical.
  let verticalPreview = (currentAspectRatio === "16:9" || currentAspectRatio === "4:5");
  
  // Get the ratio components and compute the desired aspect ratio (width/height).
  let [arW, arH] = currentAspectRatio.split(':');
  let aspect = parseFloat(arW) / parseFloat(arH);
  
  // For 16:9, invert the ratio to make it portrait (vertical).
  if (currentAspectRatio === "16:9" && verticalPreview) {
    aspect = 1 / aspect; // becomes 9:16 (≈0.5625)
  }
  // For "4:5", aspect = 4/5 (0.8), already vertical.

  // Determine available drawing dimensions.
  // If in landscape mode and a vertical preview is desired, swap dimensions.
  let availW, availH;
  if (verticalPreview && windowWidth > windowHeight) {
    availW = windowHeight;
    availH = windowWidth;
  } else {
    availW = windowWidth;
    availH = windowHeight;
  }
  
  // Calculate container dimensions to "cover" the available area while maintaining the desired aspect ratio.
  let containerWidth = availW;
  let containerHeight = availW / aspect;
  if (containerHeight > availH) {
    containerHeight = availH;
    containerWidth = availH * aspect;
  }
  
  // Determine scale factor for drawing the video feed.
  let scaleFactor = max(containerWidth / videoW, containerHeight / videoH);
  let drawWidth = videoW * scaleFactor;
  let drawHeight = videoH * scaleFactor;
  let offsetX = (containerWidth - drawWidth) / 2;
  let offsetY = (containerHeight - drawHeight) / 2;
  
  push();
  // If in landscape with vertical preview, rotate the canvas so the preview appears portrait.
  if (verticalPreview && windowWidth > windowHeight) {
    translate(windowWidth, 0);
    rotate(PI / 2);
  }
  
  // Center the preview container in the available area.
  let drawX = (availW - containerWidth) / 2;
  let drawY = (availH - containerHeight) / 2;
  translate(drawX, drawY);
  
  // Translate inside container for proper centering of the video feed.
  translate(offsetX, offsetY);
  scale(scaleFactor);
  
  // Mirror the drawn image if using the front camera (to simulate a mirror).
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
    // We no longer apply capture.elt.style.transform here because the mirroring
    // will be handled during the canvas draw.
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
  // Generate a unique filename using a timestamp.
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
  currentAspectRatio = select.value; // e.g. "16:9", "1:1", or "4:5"
  // The draw() function will now use the updated aspect ratio.
}

/**************************************
 *  pixelSize with Carets + Range
 **************************************/
function adjustPixelSize(delta) {
  let slider = document.getElementById('pixelSizeRange');
  let val = parseInt(slider.value) + delta;
  val = constrain(val, 1, 32); // updated range limit
  slider.value = val;
  updatePixelSize(val);
}

function updatePixelSize(newVal) {
  let val = parseInt(newVal);
  val = constrain(val, 1, 32); // updated range limit
  params.pixelSize = val;
  document.getElementById('pixelSizeValue').textContent = val;
}

/**************************************
 *  textSize with Carets + Range
 **************************************/
function adjustTextSize(delta) {
  let slider = document.getElementById('textSizeRange');
  let val = parseInt(slider.value) + delta;
  val = constrain(val, 1, 32); // updated range limit
  slider.value = val;
  updateTextSize(val);
}

function updateTextSize(newVal) {
  let val = parseInt(newVal);
  val = constrain(val, 1, 32); // updated range limit
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
