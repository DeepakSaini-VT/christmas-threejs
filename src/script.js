import * as THREE from "../node_modules/three/build/three.module.js";

const gameDiv = document.getElementById("game");
const canvas = document.getElementById("webgl");

const sizes = {
  x: gameDiv.clientWidth,
  y: gameDiv.clientHeight,
  pixelRatio: window.devicePixelRatio,
};

const scene = new THREE.Scene();

// Adjust OrthographicCamera parameters
const camera = new THREE.OrthographicCamera(
  -window.innerWidth / 2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  -window.innerHeight / 2,
  0.1,
  10000
);
camera.position.set(0, 0, 10);

/**
 * Video
 */
const videoElement = document.createElement("video");
videoElement.src = "../public/video.mp4";
videoElement.load();

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
const spriteMaterial = new THREE.SpriteMaterial({ map: videoTexture });
const sprite = new THREE.Sprite(spriteMaterial);
scene.add(sprite);

videoElement.addEventListener("loadedmetadata", () => {
  videoTexture.needsUpdate = true;
  const originalWidth = videoElement.videoWidth;
  const originalHeight = videoElement.videoHeight;

  const desiredHeight = window.innerHeight;
  const ratio = originalHeight / desiredHeight;
  const desiredWidth = originalWidth / ratio;

  sprite.scale.set(desiredWidth, desiredHeight, 1);
});

videoElement.addEventListener("ended", () => {
  videoElement.loop = true;
  videoElement.play();
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
updateRendererProperties(sizes.x, sizes.y);
renderer.render(scene, camera);

/**
 * Play video after option choosen from popup
 */
const soundPopup = document.querySelector(".soundPopup");
const yesBtn = document.querySelector(".yesButton");
const noBtn = document.querySelector(".noButton");
soundPopup.classList.add("show");
yesBtn.addEventListener("click", (e) => playAudioOnClick(e, false));
noBtn.addEventListener("click", (e) => playAudioOnClick(e, true));

function playAudioOnClick(event, muted) {
  event.target.classList.add("selected");
  videoElement.muted = muted;
  videoElement.play();
  soundPopup.classList.remove("show");
  soundPopup.classList.add("hide");
  setTimeout(() => {
    soundPopup.style.display = "none";
  }, 500);

  setTimeout(() => {
    document.querySelector(".popup").classList.add("show");
    document.querySelector(".popup").style.display = "block";
  }, 5000);
}

function updateRendererProperties(width, height) {
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(sizes.pixelRatio, 2));
}

// Resize handling
window.addEventListener("resize", () => {
  sizes.x = gameDiv.clientWidth;
  sizes.y = gameDiv.clientHeight;
  updateRendererProperties(sizes.x, sizes.y);
  updateCameraProperties(sizes.x, sizes.y);
});

function updateCameraProperties(width, height) {
  camera.left = -width / 2;
  camera.right = width / 2;
  camera.top = height / 2;
  camera.bottom = -height / 2;
  camera.updateProjectionMatrix();
}

const buttons = document.querySelectorAll(".optionbutton");

let optionSelected = false;
let interactable = true;

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    // Remove 'selected' class from all buttons
    if (interactable) {
      buttons.forEach((btn) => {
        optionSelected = true;
        btn.classList.remove("selected");
      });
      submitBtn.classList.add("submitted");
      // Add 'selected' class to the clicked button
      button.classList.add("selected");
    }
  });
});

const submitBtn = document.querySelector(".submitBtn");

submitBtn.addEventListener("click", () => {
  if (optionSelected) {
    interactable = false;
    const popup = document.querySelector(".popup");

    if (popup.classList.contains("show")) {
      popup.classList.remove("show");
      popup.classList.add("hide");
      popup.style.display = "none";
    } else {
      popup.classList.remove("hide");
      popup.classList.add("show");
      popup.style.display = "block";
    }
  }
});

function update() {
  renderer.render(scene, camera);
  requestAnimationFrame(update);
}

update();
