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

// /**
//  * Sprite
//  */
// const textureLoader = new THREE.TextureLoader();
// textureLoader.load("../public/landscape.png", (videoTexture) => {
//   const spriteMaterial = new THREE.SpriteMaterial({ map: videoTexture });
//   const originalWidth = videoTexture.image.width;
//   const originalHeight = videoTexture.image.height;

//   const desiredHeight = window.innerHeight;
//   const ratio = originalHeight / desiredHeight;
//   const desiredWidth = originalWidth / ratio;

//   const sprite = new THREE.Sprite(spriteMaterial);
//   scene.add(sprite);
//   videoLoaded = true;
//   soundPopup.classList.add("show");
//   sprite.scale.set(desiredWidth, desiredHeight, 1);
// });
/**
 * Video
 */
const videoElement1 = document.createElement("video");
videoElement1.src = "../public/videos/givenchy-intro.mp4";
videoElement1.load();
videoElement1.playsInline = true;
videoElement1.controls = false;
videoElement1.muted = false;
videoElement1.preload = "auto";

const videoElement2 = document.createElement("video");
videoElement2.src = "../public/videos/snow-video.mp4";
videoElement2.load();
videoElement2.playsInline = true;
videoElement2.controls = false;
videoElement2.muted = true;
videoElement2.loop = true;
videoElement2.preload = "auto";

const videoTexture = new THREE.VideoTexture(videoElement1);
videoTexture.colorSpace = THREE.SRGBColorSpace;

const videoTexture2 = new THREE.VideoTexture(videoElement2);
videoTexture2.colorSpace = THREE.SRGBColorSpace;

const spriteMaterial = new THREE.SpriteMaterial({ map: videoTexture });
const sprite = new THREE.Sprite(spriteMaterial);
scene.add(sprite);

videoElement1.addEventListener("progress", updateProgress);

function updateProgress() {
  if (videoElement1.buffered.length > 0) {
    const bufferedEnd = videoElement1.buffered.end(
      videoElement1.buffered.length - 1
    );
    const duration = videoElement1.duration;
    const percent = (bufferedEnd / duration) * 100;
    progressBar.value = percent;
  }
}
videoElement1.addEventListener("loadedmetadata", () => {
  updateProgress();
});

videoElement1.addEventListener("loadeddata", () => {
  videoLoaded = true;
  videoTexture.needsUpdate = true;
  const originalWidth = videoElement1.videoWidth;
  const originalHeight = videoElement1.videoHeight;

  const desiredHeight = window.innerHeight;
  const ratio = originalHeight / desiredHeight;
  const desiredWidth = originalWidth / ratio;
  soundPopup.classList.add("show");
  sprite.scale.set(desiredWidth, desiredHeight, 1);
});

videoElement1.addEventListener("ended", () => {
  const originalWidth = videoElement2.videoWidth;
  const originalHeight = videoElement2.videoHeight;

  const desiredHeight = window.innerHeight;
  const ratio = originalHeight / desiredHeight;
  const desiredWidth = originalWidth / ratio;
  sprite.scale.set(desiredWidth, desiredHeight, 1);

  spriteMaterial.map = videoTexture2;
  spriteMaterial.needsUpdate = true;
  spriteMaterial.map.needsUpdate = true;
  videoElement2.play();
  sound.play();
  setTimeout(() => {
    document.querySelector(".popup").classList.add("show");
    document.querySelector(".popup").style.display = "block";
  }, 5000);
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
audioLoader.load("../public/audios/backgroundSound.mp3", (audioBuffer) => {
  sound.setBuffer(audioBuffer);
  sound.setLoop(true);
  sound.setVolume(1);
});

/**
 * Play video after option choosen from popup
 */
const soundPopup = document.querySelector(".soundPopup");
const yesBtn = document.querySelector(".yesButton");

yesBtn.addEventListener("click", (e) => playAudioOnClick(e));

function playAudioOnClick(event) {
  event.target.classList.add("selected");
  soundPopup.classList.remove("show");
  soundPopup.classList.add("hide");
  setTimeout(() => {
    document.querySelector(".soundPopupBg").style.display = "none";
    soundPopup.style.display = "none";
    videoElement1.play();
  }, 500);
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
