// 1. REFERENCIAS AL DOM (Originales)
const progressBar = document.getElementById("progressBar");
const obstacle = document.getElementById("obstacle");
const decisionPanel = document.getElementById("decisionPanel");
const feedback = document.getElementById("feedback");
const options = document.querySelectorAll(".option-btn");
const character = document.getElementById("character");
const restartBtn = document.getElementById("restartBtn");
const attemptsDisplay = document.getElementById("attemptsDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");
const particlesContainer = document.getElementById("particlesContainer");

// PERSONAJES - Config con idle de espaldas
const imgBase = '../assets/img/personajes/';
const characterSpriteSets = {
    'estudiante': {
        idle: imgBase + 'Male person/PNG/Poses/character_malePerson_back.png',
        idleFallback: imgBase + 'Male person/PNG/Poses/character_malePerson_idle.png',
    },
    'matematico': {
        idle: imgBase + 'Female person/PNG/Poses/character_femalePerson_back.png',
        idleFallback: imgBase + 'Female person/PNG/Poses/character_femalePerson_idle.png',
    },
    'ingeniero':  {
        idle: imgBase + 'Male adventurer/PNG/Poses/character_maleAdventurer_back.png',
        idleFallback: imgBase + 'Male adventurer/PNG/Poses/character_maleAdventurer_idle.png',
    },
    'cientifico': {
        idle: imgBase + 'Female adventurer/PNG/Poses/character_femaleAdventurer_back.png',
        idleFallback: imgBase + 'Female adventurer/PNG/Poses/character_femaleAdventurer_idle.png',
    },
    'genio':      {
        idle: imgBase + 'Zombie/PNG/Poses/character_zombie_back.png',
        idleFallback: imgBase + 'Zombie/PNG/Poses/character_zombie_idle.png',
    },
    'robot':      {
        idle: imgBase + 'Robot/PNG/Poses/character_robot_back.png',
        idleFallback: imgBase + 'Robot/PNG/Poses/character_robot_idle.png',
    }
};

function applyCharacterFrame(spriteUrl) {
    if (!character) return;
    character.style.backgroundImage = `url(${spriteUrl})`;
    character.style.backgroundSize = 'contain';
    character.style.backgroundRepeat = 'no-repeat';
    character.style.backgroundPosition = 'center bottom';
    character.innerHTML = '';
    const img = document.createElement('img');
    img.src = spriteUrl;
    img.alt = 'Personaje';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.imageRendering = 'pixelated';
    character.appendChild(img);
}

// Cargar personaje seleccionado desde localStorage
function loadSelectedCharacter() {
    const selectedCharacterId = localStorage.getItem('selectedCharacter') || 'estudiante';
    const setConfig = characterSpriteSets[selectedCharacterId] || characterSpriteSets['estudiante'];
    const idleSprite = setConfig.idle;
    const fallback = setConfig.idleFallback;

    console.log('Intentando cargar personaje:', selectedCharacterId);
    console.log('Sprite idle:', idleSprite);

    // Mostrar frame idle de espaldas de inmediato
    applyCharacterFrame(idleSprite);

    // Si falla el sprite de espalda, usar fallback frontal
    const imgTest = new Image();
    imgTest.src = idleSprite;
    imgTest.onerror = () => {
        console.warn('No se encontró sprite de espalda, usando fallback frontal');
        applyCharacterFrame(fallback);
    };
    imgTest.onload = () => {
        // Activar animación de bobbing (CSS)
        if (character) character.classList.add('running');
    };
}

// 2. CONFIGURACIÓN DE AUDIO (Integrada)
// Usamos ../ porque game.html está dentro de la carpeta Pages
const bgMusic = new Audio('../assets/sound/audio2.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.4;

// Sonido de error cuando se presiona opción incorrecta
const errorSound = new Audio('../assets/sound/freesound_community-game-over-arcade-6435(1).mp3');
errorSound.volume = 0.6;

// ======================== */
/* SISTEMA DE PARTÍCULAS */
/* ======================== */

function createConfetti(x, y, count = 20) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa502', '#ff6348', '#00d2fc', '#00ff88', '#ffff00'];
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle confetti';
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        
        const startX = x + (Math.random() - 0.5) * 100;
        const startY = y + (Math.random() - 0.5) * 50;
        
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        
        // Movimiento lateral dinámico
        const lateralMove = (Math.random() - 0.5) * 200;
        particle.style.setProperty('--tx', lateralMove + 'px');
        
        const duration = 1.5 + Math.random();
        particle.style.animationDuration = duration + 's';
        
        particlesContainer.appendChild(particle);
        
        // Limpiar después de la animación
        setTimeout(() => particle.remove(), duration * 1000 + 100);
    }
}

function createSparkles(x, y, count = 15) {
    const sparkles = ['✨', '⭐', '💫', '✨'];
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle sparkle';
        
        particle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
        
        const startX = x + (Math.random() - 0.5) * 80;
        const startY = y + (Math.random() - 0.5) * 80;
        
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        
        const duration = 1.2 + Math.random() * 0.5;
        particle.style.animationDuration = duration + 's';
        
        particlesContainer.appendChild(particle);
        
        setTimeout(() => particle.remove(), duration * 1000 + 100);
    }
}

// 3. VARIABLES DE ESTADO (Originales)
let progress = 0;
let progressInterval = null;
let gameOver = false;
let attempts = 3;
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
const checkpoints = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
let currentCheckpointIndex = 0;

// Tipos de obstáculos disponibles
const obstacleTypes = ['type-lava', 'type-fire', 'type-ice', 'type-poison', 'type-electric'];
let currentObstacleType = 'type-lava';

function getRandomObstacleType() {
    return obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
}

function updateAttemptsDisplay() {
    if (attemptsDisplay) {
        attemptsDisplay.textContent = `❤️ ${attempts}`;
    }
}

function updateScoreDisplay() {
    if (scoreDisplay) {
        scoreDisplay.textContent = `⭐ ${score}`;
    }
}

function addScore(points) {
    score += points;
    updateScoreDisplay();
    
    // Agregar animación
    if (scoreDisplay) {
        scoreDisplay.classList.remove('animate');
        // Trigger reflow para reiniciar la animación
        void scoreDisplay.offsetWidth;
        scoreDisplay.classList.add('animate');
        
        // Remover clase después de la animación
        setTimeout(() => {
            scoreDisplay.classList.remove('animate');
        }, 500);
    }
}

// 4. FUNCIONES DE AUDIO
const habilitarAudio = () => {
    if (bgMusic.paused) {
        bgMusic.play().catch(e => console.log("Interacción necesaria para sonar."));
    }
};

// Función para intentar reproducir música del juego inmediatamente
function playGameMusicAggressive() {
    bgMusic.play().then(() => {
        console.log('✓ Música de juego iniciada automáticamente');
        try { localStorage.setItem('audioAllowed', 'true'); } catch (e) {}
    }).catch(() => {
        console.log('⚠ Autoplay bloqueado, iniciar al primer clic...');
        document.addEventListener('click', habilitarAudio, { once: true });
    });
}

// Ejecutar inmediatamente
playGameMusicAggressive();

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
    // Seleccionar tipo de obstáculo al azar
    currentObstacleType = getRandomObstacleType();
    
    // Limpiar clases anteriores y agregar la nueva
    obstacle.className = 'obstacle';
    obstacle.classList.add('active', currentObstacleType);
}

function showDecision() {
    decisionPanel.classList.add("active");
    feedback.textContent = "";
}

// 6. MANEJO DE OPCIONES (Original + Activación de Audio)
options.forEach(option => {
    option.addEventListener("click", () => {
        // Aprovechar el clic en la opción para asegurar que el audio suene
        habilitarAudio();

        const isCorrect = option.dataset.correct === "true";

        if (isCorrect) {
            // Respuesta correcta: Animar avance y desaparición del obstáculo
            character.classList.add("advancing");
            obstacle.classList.add("disappearing");
            
            // Sumar puntos
            addScore(100);
            
            // Crear efectos de partículas
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            createConfetti(centerX, centerY, 25);
            createSparkles(centerX, centerY - 50, 20);
            
            // Dejar que termine la animación
            setTimeout(() => {
                decisionPanel.classList.remove("active");
                obstacle.className = 'obstacle';
                character.classList.remove("advancing");

                currentCheckpointIndex++;

                if (currentCheckpointIndex < checkpoints.length) {
                    resumeProgress();
                } else {
                    finishGame();
                }
            }, 500);
        } else {
            // Respuesta incorrecta: Mostrar error pero permitir reintentar
            attempts--;
            updateAttemptsDisplay();
            
            // Reproducir sonido de error
            errorSound.currentTime = 0;
            errorSound.play().catch(e => console.log("No se pudo reproducir sonido de error:", e));
            
            // Mostrar mensaje de error
            if (attempts > 0) {
                // Aún hay intentos - permitir reintentar
                feedback.textContent = `❌ Incorrecto. Intentos restantes: ${attempts}`;
                feedback.style.color = "#ff6666";
                
                // Animar el botón incorrecto
                option.style.animation = "shake 0.3s ease-in-out";
                setTimeout(() => {
                    option.style.animation = "";
                }, 300);
            } else {
                // Game over definitivo - se acabaron los intentos
                character.classList.add("colliding");
                obstacle.classList.remove("active");
                gameOver = true;
                stopProgress();
                
                feedback.textContent = "¡GAME OVER! Se acabaron los intentos.";
                feedback.style.color = "#ff0000";
                progressBar.style.width = "0%";
                progress = 0;
                currentCheckpointIndex = 0;
                
                // Deshabilitar botones
                options.forEach(btn => {
                    btn.disabled = true;
                    btn.style.opacity = "0.5";
                    btn.style.cursor = "not-allowed";
                });
                
                // Reiniciar automáticamente después de 2 segundos
                setTimeout(() => {
                    resetGame();
                }, 2000);
            }
        }
    });
});

// Manejo del botón de reinicio
if (restartBtn) {
    restartBtn.addEventListener("click", resetGame);
}

function resetGame() {
    // Resetear variables
    gameOver = false;
    progress = 0;
    currentCheckpointIndex = 0;
    attempts = 3;
    score = 0;
    updateAttemptsDisplay();
    updateScoreDisplay();
    
    // Limpiar partículas
    if (particlesContainer) {
        particlesContainer.innerHTML = '';
    }
    
    // Limpiar estilos y clases
    progressBar.style.width = "0%";
    feedback.textContent = "";
    feedback.style.color = "#ccc";
    character.classList.remove("colliding");
    
    // Limpiar todas las clases de obstáculo
    obstacle.className = 'obstacle';
    obstacle.classList.remove("active", "disappearing");
    
    decisionPanel.classList.remove("active");
    restartBtn.style.display = "none";
    
    // Rehabilitar botones de opciones
    options.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
    });
    
    // Recargar el personaje
    loadSelectedCharacter();
    
    // Iniciar de nuevo
    startProgress();
}

function resumeProgress() {
    startProgress();
}

function finishGame() {
    // Validar si es nuevo mejor score
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
        feedback.textContent = `¡HAS GANADO! 🏆\nPuntuación: ${score} ⭐\n¡NUEVO RÉCORD!`;
    } else {
        feedback.textContent = `¡HAS GANADO! 🏆\nPuntuación: ${score} ⭐\nMejor: ${bestScore}`;
    }
    
    feedback.style.color = "#4ade80";
    
    // Explosión de partículas al ganar
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    createConfetti(centerX, centerY, 50);
    createSparkles(centerX, centerY - 100, 40);
    
    // Opcional: bajar volumen al terminar
    bgMusic.volume = 0.2; 
}

// 7. INICIO AL CARGAR (Simplificado - música inicia en script load)
window.addEventListener("load", () => {
    // Cargar el personaje seleccionado
    loadSelectedCharacter();

    // Inicializar displays
    updateAttemptsDisplay();
    updateScoreDisplay();

    // Iniciar el juego
    startProgress();
});

// Pausar música del juego al salir de la página
window.addEventListener('beforeunload', () => {
    bgMusic.pause();
    bgMusic.currentTime = 0;
});

// Reiniciar música cuando se regresa a la página (desde bfcache o navegación)
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // Página restaurada desde bfcache
        playGameMusicAggressive();
    }
});

// Reiniciar música cuando la pestaña vuelve a estar activa
window.addEventListener('focus', () => {
    if (bgMusic.paused) {
        playGameMusicAggressive();
    }
});
