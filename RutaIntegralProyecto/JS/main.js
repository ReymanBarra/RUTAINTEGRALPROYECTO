// Botón iniciar juego
const btnStart = document.getElementById("btnStart");
if (btnStart) {
  btnStart.addEventListener("click", () => {
    window.location.href = "Pages/game.html";
  });
}

// Botón información
const btnInfo = document.getElementById("btnInfo");
if (btnInfo) {
  btnInfo.addEventListener("click", () => {
    window.location.href = "Pages/info.html";
  });
}

// Botón volver
const btnBack = document.getElementById("btnBack");
if (btnBack) {
  btnBack.addEventListener("click", () => {
    window.location.href = "../index.html";
  });
}
