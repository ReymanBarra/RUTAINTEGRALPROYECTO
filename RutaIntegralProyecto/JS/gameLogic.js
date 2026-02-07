// 1. REFERENCIAS AL DOM (Originales)
const progressBar = document.getElementById("progressBar");
const obstacle = document.getElementById("obstacle");
const decisionPanel = document.getElementById("decisionPanel");
const feedback = document.getElementById("feedback");
const options = document.querySelectorAll(".option-btn");

// 2. CONFIGURACIÓN DE AUDIO (Integrada)
// Usamos ../ porque game.html está dentro de la carpeta Pages
const bgMusic = new Audio('../assets/sound/audio2.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.4;

// 3. VARIABLES DE ESTADO (Originales)
let progress = 0;
let progressInterval = null;
const checkpoints = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
let currentCheckpointIndex = 0;

// 4. FUNCIONES DE AUDIO
const habilitarAudio = () => {
    if (bgMusic.paused) {
        bgMusic.play().catch(e => console.log("Interacción necesaria para sonar."));
    }
};

// 5. LÓGICA DE PROGRESO (Original)
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

// 6. MANEJO DE OPCIONES (Original + Activación de Audio)
options.forEach(option => {
    option.addEventListener("click", () => {
        // Aprovechamos el clic en la opción para asegurar que el audio suene
        habilitarAudio();

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

function resumeProgress() {
    startProgress();
}

function finishGame() {
    feedback.textContent = "¡Has completado la Ruta Integral!";
    // Opcional: bajar volumen al terminar
    bgMusic.volume = 0.2; 
}

// 7. INICIO AL CARGAR (Con manejo de Autoplay)
window.addEventListener("load", () => {
    // Intentar sonar apenas carga (funciona si el clic en index.html fue suficiente)
    bgMusic.play().catch(() => {
        console.log("El navegador bloqueó el autoplay. Sonará al interactuar.");
        // Respaldo: Activar con el primer clic en cualquier parte si falla lo anterior
        document.addEventListener('click', habilitarAudio, { once: true });
    });
    
    startProgress();
});