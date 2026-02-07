const progressBar = document.getElementById("progressBar");
const obstacle = document.getElementById("obstacle");
const decisionPanel = document.getElementById("decisionPanel");
const feedback = document.getElementById("feedback");
const options = document.querySelectorAll(".option-btn");

let progress = 0;
let progressInterval = null;

// Puntos donde se detiene (10 ítems)
const checkpoints = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
let currentCheckpointIndex = 0;

// Iniciar progreso
function startProgress() {
  progressInterval = setInterval(() => {
    const currentStop = checkpoints[currentCheckpointIndex];

    if (progress < currentStop) {
      progress += 1;
      progressBar.style.width = progress + "%";
    } else {
      stopProgress();
      showObstacle();
      showDecision();
    }
  }, 300);
}

function stopProgress() {
  clearInterval(progressInterval);
}

function showObstacle() {
  obstacle.classList.add("active");
}

function showDecision() {
  decisionPanel.classList.add("active");
  feedback.textContent = "";
}

// Manejo de opciones
options.forEach(option => {
  option.addEventListener("click", () => {
    const isCorrect = option.dataset.correct === "true";

    if (isCorrect) {
      decisionPanel.classList.remove("active");
      obstacle.classList.remove("active");

      currentCheckpointIndex++;

      if (currentCheckpointIndex < checkpoints.length) {
        resumeProgress();
      } else {
        finishGame();
      }
    } else {
      feedback.textContent = "Incorrecto. Intenta otra opción.";
    }
  });
});

// Reanudar progreso
function resumeProgress() {
  startProgress();
}

// Final del juego
function finishGame() {
  feedback.textContent = "¡Has completado la Ruta Integral!";
}

// Iniciar al cargar
window.addEventListener("load", () => {
  startProgress();
});
