import { loadDatabase } from "./database.js";
import { state } from "./state.js";
import { findPlayerByName, getPlayerSuggestions } from "./search.js";
import { buildSummaryData } from "./services/summaryService.js";
import { renderSummary } from "./render/renderSummary.js";
import { renderMatchHistory } from "./render/renderMatchHistory.js";

const searchInput = document.getElementById("summoner-search");
const searchButton = document.getElementById("search-button");
const suggestionsList = document.getElementById("summoner-suggestions");
const message = document.getElementById("message");
const profileTabs = document.getElementById("profile-tabs");
const tabButtons = document.querySelectorAll(".profile-tab");
const profilePanels = document.querySelectorAll(".profile-panel");

searchButton.disabled = true;

function setActiveTab(tabName) {
  tabButtons.forEach(button => {
    button.classList.toggle("is-active", button.dataset.tab === tabName);
  });

  profilePanels.forEach(panel => {
    panel.hidden = panel.dataset.panel !== tabName;
  });
}

function renderSuggestions(searchText = "") {
  if (!state.database || !suggestionsList) {
    return;
  }

  const suggestions = getPlayerSuggestions(state.database.players, searchText).slice(0, 8);

  suggestionsList.innerHTML = suggestions
    .map(player => `<option value="${player.summonerName}#${player.tag}"></option>`)
    .join("");
}

async function initApp() {
  try {
    state.database = await loadDatabase();

    searchButton.disabled = false;
    renderSuggestions();
    message.textContent = "Base de datos lista. Busca un invocador para ver su perfil.";
  } catch (error) {
    console.error(error);
    message.textContent = "Error al cargar los archivos JSON.";
  }
}

function handleSearch() {
  if (!state.database) {
    message.textContent = "La base de datos aun se esta cargando.";
    return;
  }

  const player = findPlayerByName(state.database.players, searchInput.value);

  if (!player) {
    message.textContent = "No se encontro ese invocador.";
    return;
  }

  state.currentPlayer = player;
  state.currentSummary = buildSummaryData(player, state.database);

  renderSummary(state.currentSummary);
  renderMatchHistory(player, state.database);

  profileTabs.hidden = false;
  setActiveTab("summary");
  message.textContent = "";
}

searchButton.addEventListener("click", handleSearch);

tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.tab);
  });
});

searchInput.addEventListener("input", () => {
  renderSuggestions(searchInput.value);
});

searchInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

initApp();
