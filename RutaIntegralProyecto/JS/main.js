// JS/main.js
const startSfx = new Audio('assets/sound/start_button.mp3');
const btnStart = document.getElementById("btnStart");

if (btnStart) {
    btnStart.addEventListener("click", (e) => {
        e.preventDefault();
        
        // Ejecución del efecto de sonido
        startSfx.play().catch(err => console.error("Error de audio inicial:", err));

        // Retraso técnico para permitir la reproducción del SFX antes de navegar
        setTimeout(() => {
            window.location.href = "Pages/game.html";
        }, 300);
    });
}

const btnInfo = document.getElementById("btnInfo");
if (btnInfo) {
    btnInfo.addEventListener("click", () => {
        window.location.href = "Pages/info.html";
    });
}