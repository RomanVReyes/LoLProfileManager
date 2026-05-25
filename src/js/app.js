import { loadDatabase } from "./database.js";
import { state } from "./state.js";
import { findPlayerByName, getPlayerSuggestions } from "./search.js";
import { buildSummaryData } from "./services/summaryService.js";
import { renderSummary } from "./render/renderSummary.js";

const searchInput = document.getElementById("summoner-search");
const searchButton = document.getElementById("search-button");
const suggestionsList = document.getElementById("summoner-suggestions");
const message = document.getElementById("message");

searchButton.disabled = true;

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

  message.textContent = "";
}

searchButton.addEventListener("click", handleSearch);

searchInput.addEventListener("input", () => {
  renderSuggestions(searchInput.value);
});

searchInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

initApp();
