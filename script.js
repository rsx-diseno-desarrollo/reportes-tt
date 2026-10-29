// Overlay: se muestra al entrar y se cierra al continuar.
const welcomeOverlay = document.querySelector("#welcome-overlay");
const continueButton = document.querySelector("#continue-button");

continueButton.addEventListener("click", () => {
  welcomeOverlay.hidden = true;
});

// Alternar entre generar y consultar.
const modeButtons = document.querySelectorAll(".mode-button");

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedPanelId = button.dataset.panel;

    modeButtons.forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle("is-active", isSelected);
      item.setAttribute("aria-selected", String(isSelected));
    });

    document.querySelector("#generate-panel").hidden =
      selectedPanelId !== "generate-panel";

    document.querySelector("#search-panel").hidden =
      selectedPanelId !== "search-panel";

    document.querySelector("#analysis-panel").hidden =
      selectedPanelId !== "analysis-panel";
  });
});

// Búsqueda de demostración: todavía no consulta ni filtra reportes.
const searchForm = document.querySelector("#search-form");
const searchStatus = document.querySelector("#search-status");

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const values = new FormData(searchForm);
  const fecha = values.get("fecha");
  const empleado = values.get("empleado").trim();

  searchStatus.classList.remove("error");

  if (!fecha && !empleado) {
    searchStatus.textContent =
      "Ingresa una fecha, un número de empleado o ambos para buscar.";
    searchStatus.classList.add("error");
    return;
  }

  searchStatus.textContent =
    "La consulta es una demostración. Aún no hay una base de datos conectada.";
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js");

      console.log("TT Inspector: SW registrado");
    } catch (error) {
      console.error(
        "TT Inspector: Error registrando SW",
        error
      );
    }
  });
}
