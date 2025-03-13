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

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Default constraints to back camera
  let constraints = {
    video: { facingMode: { exact: "environment" } },
    audio: false
  };
  
  capture = createCapture(constraints, () => {
    capturing = true;
    console.log("Camera initialized");
  });
  
  // For iOS inline
  capture.elt.setAttribute('playsinline', '');
  
  // Match the capture size to our canvas
  capture.size(windowWidth, windowHeight);
  capture.hide();
}

function draw() {
  background(params.background);
  if (!capturing) return;

  // ASCII text settings
  textSize(params.textSize);
  fill(params.colour);

  capture.loadPixels();

  if (capture.pixels.length > 0) {
    let chars = params.characters.split('');
    for (let y = 0; y < capture.height; y += params.pixelSize) {
      for (let x = 0; x < capture.width; x += params.pixelSize) {
        let index = (x + y * capture.width) * 4;
        let r = capture.pixels[index + 0];
        let g = capture.pixels[index + 1];
        let b = capture.pixels[index + 2];
        
        let bright = (r + g + b) / 3;
        let charIndex = floor(map(bright, 0, 255, chars.length - 1, 0));
        text(chars[charIndex], x, y);
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/**************************************
 *  Camera Switching
 **************************************/
function switchCamera() {
  frontCam = !frontCam;
  capture.remove();

  let constraints = {
    video: {
      facingMode: frontCam ? "user" : { exact: "environment" }
    },
    audio: false
  };
  
  capture = createCapture(constraints, () => {
    capturing = true;
    console.log("Switched camera");
  });
  
  capture.elt.setAttribute('playsinline', '');
  capture.size(windowWidth, windowHeight);
  capture.hide();
}

/**************************************
 *  Snapshot + Media Management
 **************************************/
function takeSnapshot() {
  // Convert current canvas to Data URL
  let snapshotDataURL = canvas.toDataURL('image/png');
  
  // Display the snapshot in the overlay
  let img = document.getElementById('snapshotImg');
  img.src = snapshotDataURL;
  
  // Show overlay
  document.getElementById('mediaManagementOverlay').style.display = 'block';
}

function deletePhoto() {
  // Hide overlay without saving
  document.getElementById('mediaManagementOverlay').style.display = 'none';
}

function savePhoto() {
  // Trigger a download of the snapshot
  let link = document.createElement('a');
  let imgSrc = document.getElementById('snapshotImg').src;
  link.download = 'ascii-photo.png';
  link.href = imgSrc;
  link.click();
}

function sharePhoto() {
  // Use Web Share API if available
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
  // Toggle display
  if (overlay.style.display === 'none' || overlay.style.display === '') {
    overlay.style.display = 'block';
  } else {
    overlay.style.display = 'none';
  }
}
