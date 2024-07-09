import * as THREE from "../node_modules/three/build/three.module.js";

const gameDiv = document.getElementById("game");
const canvas = document.getElementById("webgl");

const sizes = {
  x: gameDiv.clientWidth,
  y: gameDiv.clientHeight,
  pixelRatio: window.devicePixelRatio,
};

const scene = new THREE.Scene();

/**
 * Loading Manager
 */
const loadingScreen = document.querySelector(".loadingScreen");
const progressBar = document.querySelector(".progress-bar");

const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = onProgress;

let soundLoaded = false,
  videoLoaded = false,
  hideLoadingScreen = false;

function onProgress(url, loaded, total) {
  progressBar.value = (loaded / total) * 100;
  if (progressBar.value === 100) {
    // loadingScreen.style.display = "none";
    soundLoaded = true;
  }
}

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
videoElement.playsInline = true;
videoElement.controls = false;
videoElement.muted = true;
videoElement.preload = "auto";

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
const spriteMaterial = new THREE.SpriteMaterial({ map: videoTexture });
const sprite = new THREE.Sprite(spriteMaterial);
scene.add(sprite);

videoElement.addEventListener("progress", updateProgress);

function updateProgress() {
  if (videoElement.buffered.length > 0) {
    const bufferedEnd = videoElement.buffered.end(
      videoElement.buffered.length - 1
    );
    const duration = videoElement.duration;
    const percent = (bufferedEnd / duration) * 100;
    progressBar.value = percent;
  }
}
videoElement.addEventListener("loadedmetadata", () => {
  updateProgress();
});

videoElement.addEventListener("loadeddata", () => {
  videoLoaded = true;
  videoTexture.needsUpdate = true;
  const originalWidth = videoElement.videoWidth;
  const originalHeight = videoElement.videoHeight;

  const desiredHeight = window.innerHeight;
  const ratio = originalHeight / desiredHeight;
  const desiredWidth = originalWidth / ratio;
  soundPopup.classList.add("show");
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
 * Audio
 */
const audioLoader = new THREE.AudioLoader(loadingManager);
const audioListener = new THREE.AudioListener();
camera.add(audioListener);
const sound = new THREE.Audio(audioListener);
audioLoader.load("../public/backgroundSound.mp3", (audioBuffer) => {
  sound.setBuffer(audioBuffer);
  sound.setLoop(true);
  sound.setVolume(0.5);
});

/**
 * Play video after option choosen from popup
 */
const soundPopup = document.querySelector(".soundPopup");
const yesBtn = document.querySelector(".yesButton");
// const noBtn = document.querySelector(".noButton");

yesBtn.addEventListener("click", (e) => playAudioOnClick(e, 1));
// noBtn.addEventListener("click", (e) => playAudioOnClick(e, 0));

function playAudioOnClick(event, volume) {
  event.target.classList.add("selected");
  // videoElement.muted = muted;
  videoElement.play();
  sound.setVolume(volume);
  sound.play();
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
  if (videoLoaded && soundLoaded && !hideLoadingScreen) {
    loadingScreen.style.display = "none";
    hideLoadingScreen = true;
  }
  requestAnimationFrame(update);
}

update();
