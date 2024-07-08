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
videoElement.muted = true;

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
const spriteMaterial = new THREE.SpriteMaterial({ map: videoTexture });
const sprite = new THREE.Sprite(spriteMaterial);
scene.add(sprite);

videoElement.addEventListener("loadedmetadata", () => {
  videoTexture.needsUpdate = true;
  const originalWidth = videoElement.videoWidth;
  const originalHeight = videoElement.videoHeight;
  // const videoAspectRatio1 = originalWidth / originalHeight;
  const desiredHeight = window.innerHeight;
  const ratio = originalHeight / desiredHeight;
  const desiredWidth = originalWidth / ratio;
  // const videoAspectRatio2 = desiredWidth / desiredHeight;
  sprite.scale.set(desiredWidth, desiredHeight, 1);
  videoElement.play();
});

setTimeout(() => {
  document.querySelector(".popup").classList.add("show");
  document.querySelector(".popup").style.display = "block";
}, 5000);

videoElement.addEventListener("ended", () => {
  videoElement.loop = true;
  videoElement.play();
});

/**
 * Sound
 */
const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load(
  "../public/gentle-electric-guitar-loop-smoot-wet_160bpm_E_major.wav",
  (audioBuffer) => {
    sound.setBuffer(audioBuffer);
    sound.setLoop(true);
    sound.setVolume(1);
  }
);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
updateRendererProperties(sizes.x, sizes.y);
renderer.render(scene, camera);

canvas.addEventListener("click", () => {
  videoElement.play().catch((error) => {
    console.error("Error attempting to play the video:", error);
  });
  sound.play();
});

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
    } else {
      popup.classList.remove("hide");
      popup.classList.add("show");
    }
  }
});

function update() {
  renderer.render(scene, camera);
  requestAnimationFrame(update);
}

update();
