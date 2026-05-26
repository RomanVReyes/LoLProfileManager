const RESULT_LABEL = {
  win: "Victoria",
  draw: "Empate",
  loss: "Derrota"
};

const RESULT_TONE = {
  win: "win",
  draw: "draw",
  loss: "loss"
};

const DETAIL_TABS = [
  { id: "scoreboard", label: "Tablero de puntuaciones" },
  { id: "damage", label: "Dano" },
  { id: "vision", label: "Vision" },
  { id: "builds", label: "Builds" },
  { id: "timeline", label: "Linea de tiempo" }
];

const FALLBACK_RUNES = [
  "precision/conqueror.png",
  "precision/presstheattack.png",
  "domination/electrocute.png",
  "domination/darkharvest.png",
  "sorcery/arcanecomet.png",
  "resolve/graspoftheundying.png",
  "inspiration/firststrike.png"
];

const FALLBACK_SPELLS = [
  "Flash_HD.png",
  "Ignite_HD.png",
  "Heal_HD.png",
  "Teleport_HD.png",
  "Smite_HD.png",
  "Ghost_HD.png",
  "Exhaust_HD.png",
  "Barrier_HD.png"
];

const FALLBACK_ITEMS = [
  "Berserker's_Greaves_item_HD.png",
  "Blade_of_the_Ruined_King_item_HD.png",
  "Black_Cleaver_item_HD.png",
  "Bloodthirster_item_HD.png",
  "Axiom_Arc_item_HD.png",
  "Death's_Dance_item_HD.png",
  "Bramble_Vest_item_HD.png",
  "Control_Ward_item_HD.png",
  "Cosmic_Drive_item_HD.png",
  "Banshee's_Veil_item_HD.png",
  "Ardent_Censer_item_HD.png",
  "Dawncore_item_HD.png"
];

const TEAM_NAMES = ["Equipo 1", "Equipo 2"];
const ROLES = ["Top", "Jungla", "Mid", "ADC", "Support"];
const PLACEHOLDER_NAMES = [
  "Solar Warden",
  "River Blade",
  "Midnight Arc",
  "Nexus Bloom",
  "Iron Aegis",
  "Crimson Wave",
  "Blue Sentinel",
  "Golden Mark",
  "Void Signal",
  "Lane Oracle"
];

function formatDuration(seconds = 0) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateValue));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function pickBySeed(items, seed, offset = 0) {
  if (!items.length) {
    return null;
  }

  return items[Math.abs(seed + offset) % items.length];
}

function seedFromMatch(match) {
  return [...match.id].reduce((total, character) => total + character.charCodeAt(0), 0);
}

function toNumber(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function renderIcon(src, alt, className = "") {
  if (!src || src.includes("undefined") || src.includes("null")) {
    return "";
  }

  return `<img class="${className}" src="${src}" alt="${escapeHtml(alt)}" onerror="this.remove()">`;
}

function itemSlots(items = []) {
  return [...items.slice(0, 8), ...Array(Math.max(0, 8 - items.length)).fill(null)];
}

function getChampion(championById, championId, fallbackChampion) {
  return championById.get(championId) ?? fallbackChampion ?? championById.values().next().value;
}

function buildFallbackPlayer({
  match,
  player,
  champion,
  seed,
  index,
  teamIndex,
  isFocusedPlayer = false,
  championPool
}) {
  const selectedChampion = isFocusedPlayer
    ? champion
    : pickBySeed(championPool, seed, index + teamIndex * 5) ?? champion;
  const kills = isFocusedPlayer ? match.kills : Math.max(0, ((seed + index * 3 + teamIndex) % 11) + teamIndex);
  const deaths = isFocusedPlayer ? match.deaths : Math.max(1, ((seed + index * 5 + teamIndex * 2) % 9) + 1);
  const assists = isFocusedPlayer ? match.assists : Math.max(2, ((seed + index * 7 + teamIndex) % 18) + 3);
  const baseItems = isFocusedPlayer && match.items?.length ? match.items : FALLBACK_ITEMS;
  const generatedItems = isFocusedPlayer
    ? match.items
    : Array.from({ length: 6 }, (_, itemIndex) => pickBySeed(baseItems, seed, index * 2 + itemIndex + teamIndex));

  return {
    summonerName: isFocusedPlayer ? `${player.summonerName}#${player.tag}` : PLACEHOLDER_NAMES[index + teamIndex * 5],
    championName: selectedChampion?.name ?? "Campeon",
    championIcon: selectedChampion?.icon,
    championLevel: isFocusedPlayer ? match.championLevel : Math.max(10, 18 - ((index + teamIndex) % 7)),
    mainRune: pickBySeed(FALLBACK_RUNES, seed, index + teamIndex),
    spells: isFocusedPlayer ? (match.spells ?? []) : [
      "Flash_HD.png",
      pickBySeed(FALLBACK_SPELLS.slice(1), seed, index + teamIndex)
    ],
    items: generatedItems ?? [],
    kills,
    deaths,
    assists,
    minionsKilled: isFocusedPlayer ? match.minionsKilled : Math.max(18, 42 + ((seed + index * 39 + teamIndex * 17) % 198)),
    goldEarned: isFocusedPlayer ? match.goldEarned : 7400 + ((seed + index * 977 + teamIndex * 521) % 8700)
  };
}

function buildFallbackTeams(match, player, championById) {
  const seed = seedFromMatch(match);
  const focusedChampion = getChampion(championById, match.championId);
  const championPool = [...championById.values()].filter(champion => champion.id !== match.championId);
  const focusedRoleIndex = Math.max(0, ROLES.indexOf(focusedChampion?.role ?? "ADC"));

  const teams = [0, 1].map(teamIndex => {
    const players = ROLES.map((role, index) => buildFallbackPlayer({
      match,
      player,
      champion: focusedChampion,
      seed,
      index,
      teamIndex,
      isFocusedPlayer: teamIndex === 0 && index === focusedRoleIndex,
      championPool
    }));

    return {
      name: TEAM_NAMES[teamIndex],
      result: teamIndex === 0 ? match.result : (match.result === "win" ? "loss" : match.result === "loss" ? "win" : "draw"),
      players,
      bans: Array.from({ length: 5 }, (_, index) => pickBySeed(championPool, seed, index + teamIndex * 7)),
      objectives: {
        torres: 3 + ((seed + teamIndex) % 8),
        dragones: teamIndex === 0 && match.result === "win" ? 3 : 1 + ((seed + teamIndex) % 3),
        baron: match.durationSeconds > 1700 && teamIndex === 0 && match.result !== "loss" ? 1 : 0,
        herald: 1 + ((seed + teamIndex) % 2),
        inhibidores: match.result === "win" && teamIndex === 0 ? 2 : ((seed + teamIndex) % 2)
      }
    };
  });

  return teams.map(team => ({
    ...team,
    kills: team.players.reduce((total, participant) => total + participant.kills, 0),
    deaths: team.players.reduce((total, participant) => total + participant.deaths, 0),
    assists: team.players.reduce((total, participant) => total + participant.assists, 0),
    goldEarned: team.players.reduce((total, participant) => total + participant.goldEarned, 0)
  }));
}

function normalizePlayer(participant, championById) {
  const champion = getChampion(championById, participant.championId, null);

  return {
    summonerName: participant.summonerName ?? participant.name ?? "Invocador",
    championName: participant.championName ?? champion?.name ?? "Campeon",
    championIcon: participant.championIcon ?? champion?.icon,
    championLevel: toNumber(participant.championLevel ?? participant.level, 1),
    mainRune: participant.mainRune ?? participant.rune ?? participant.runeIcon,
    spells: participant.spells ?? [],
    items: participant.items ?? [],
    kills: toNumber(participant.kills),
    deaths: toNumber(participant.deaths),
    assists: toNumber(participant.assists),
    minionsKilled: toNumber(participant.minionsKilled ?? participant.cs),
    goldEarned: toNumber(participant.goldEarned ?? participant.gold)
  };
}

function normalizeTeams(match, player, championById) {
  if (!Array.isArray(match.teams) || match.teams.length < 2) {
    return buildFallbackTeams(match, player, championById);
  }

  return match.teams.slice(0, 2).map((team, index) => {
    const players = (team.players ?? team.participants ?? []).map(participant => normalizePlayer(participant, championById));

    return {
      name: team.name ?? TEAM_NAMES[index],
      result: team.result ?? (index === 0 ? match.result : null),
      players,
      bans: team.bans ?? [],
      objectives: team.objectives ?? {},
      kills: toNumber(team.kills, players.reduce((total, participant) => total + participant.kills, 0)),
      deaths: toNumber(team.deaths, players.reduce((total, participant) => total + participant.deaths, 0)),
      assists: toNumber(team.assists, players.reduce((total, participant) => total + participant.assists, 0)),
      goldEarned: toNumber(team.goldEarned ?? team.gold, players.reduce((total, participant) => total + participant.goldEarned, 0))
    };
  });
}

function renderBan(ban, championById) {
  const champion = typeof ban === "number" ? championById.get(ban) : championById.get(ban?.championId) ?? ban;
  const icon = champion?.icon;
  const name = champion?.name ?? "Bloqueo";

  return `
    <div class="match-ban" title="${escapeHtml(name)}">
      ${renderIcon(`./assets/champions/Icons/${icon}`, name)}
    </div>
  `;
}

function renderObjectiveList(objectives = {}) {
  const entries = [
    ["Torres", objectives.torres ?? objectives.towers ?? 0],
    ["Dragones", objectives.dragones ?? objectives.dragons ?? 0],
    ["Baron", objectives.baron ?? objectives.barons ?? 0],
    ["Herald", objectives.herald ?? objectives.heralds ?? 0],
    ["Inhibidores", objectives.inhibidores ?? objectives.inhibitors ?? 0]
  ];

  return entries.map(([label, value]) => `
    <div class="objective-chip">
      <span>${label}</span>
      <strong>${toNumber(value)}</strong>
    </div>
  `).join("");
}

function renderParticipantRow(participant) {
  return `
    <div class="scoreboard-row">
      <div class="participant-rune">
        ${renderIcon(`./assets/runes/${participant.mainRune}`, "Runa principal")}
      </div>

      <div class="participant-spells">
        ${participant.spells.slice(0, 2).map(spell => renderIcon(`./assets/spells/${spell}`, "Hechizo de invocador")).join("")}
      </div>

      <div class="participant-level">${participant.championLevel}</div>

      <div class="participant-champion">
        ${renderIcon(`./assets/champions/Icons/${participant.championIcon}`, participant.championName)}
      </div>

      <div class="participant-name">
        <strong>${escapeHtml(participant.summonerName)}</strong>
        <span>${escapeHtml(participant.championName)}</span>
      </div>

      <div class="participant-items">
        ${itemSlots(participant.items).map(item => `
          <div class="participant-item-slot">
            ${item ? renderIcon(`./assets/items/${item}`, "Objeto") : ""}
          </div>
        `).join("")}
      </div>

      <div class="participant-kda">
        <strong>${participant.kills} / ${participant.deaths} / ${participant.assists}</strong>
      </div>

      <div class="participant-stat">${participant.minionsKilled}</div>
      <div class="participant-stat">${participant.goldEarned.toLocaleString("es-MX")}</div>
    </div>
  `;
}

function renderTeamScoreboard(team, championById) {
  return `
    <article class="scoreboard-team scoreboard-team--${RESULT_TONE[team.result] ?? "draw"}">
      <header class="scoreboard-team-header">
        <div>
          <span>${escapeHtml(team.name)}</span>
          <strong>${RESULT_LABEL[team.result] ?? "Equipo"}</strong>
        </div>

        <div class="team-totals">
          <div>
            <span>K / D / A</span>
            <strong>${team.kills} / ${team.deaths} / ${team.assists}</strong>
          </div>
          <div>
            <span>Oro</span>
            <strong>${team.goldEarned.toLocaleString("es-MX")}</strong>
          </div>
        </div>
      </header>

      <div class="scoreboard-extras">
        <section>
          <h4>Bloqueos</h4>
          <div class="match-bans">
            ${(team.bans ?? []).slice(0, 5).map(ban => renderBan(ban, championById)).join("")}
          </div>
        </section>

        <section>
          <h4>Objetivos</h4>
          <div class="objective-list">
            ${renderObjectiveList(team.objectives)}
          </div>
        </section>
      </div>

      <div class="scoreboard-table" role="table" aria-label="${escapeHtml(team.name)}">
        <div class="scoreboard-row scoreboard-row--head" role="row">
          <span>Runa</span>
          <span>Hechizos</span>
          <span>Niv</span>
          <span>Champ</span>
          <span>Jugador</span>
          <span>Objetos</span>
          <span>KDA</span>
          <span>CS</span>
          <span>Oro</span>
        </div>

        ${team.players.map(renderParticipantRow).join("")}
      </div>
    </article>
  `;
}

function renderScoreboard(match, player, championById) {
  const teams = normalizeTeams(match, player, championById);

  return `
    <div class="scoreboard-grid">
      ${teams.map(team => renderTeamScoreboard(team, championById)).join("")}
    </div>
  `;
}

function renderPlaceholderTab(tab) {
  return `
    <div class="detail-placeholder">
      <strong>${escapeHtml(tab.label)}</strong>
      <span>Placeholder reservado para esta pestana.</span>
    </div>
  `;
}

function renderMatchDetail(match, player, championById, activeTab = "scoreboard") {
  const currentTab = DETAIL_TABS.find(tab => tab.id === activeTab) ?? DETAIL_TABS[0];

  return `
    <section class="match-detail match-detail--${RESULT_TONE[match.result] ?? "draw"}">
      <header class="match-detail-hero">
        <div class="match-detail-result">
          <span>Resultado</span>
          <strong>${RESULT_LABEL[match.result] ?? match.result}</strong>
        </div>

        <div class="match-detail-facts">
          <div>
            <span>Mapa</span>
            <strong>${escapeHtml(match.mapName)}</strong>
          </div>
          <div>
            <span>Modo</span>
            <strong>${escapeHtml(match.gameMode)}</strong>
          </div>
          <div>
            <span>Duracion</span>
            <strong>${formatDuration(match.durationSeconds)}</strong>
          </div>
          <div>
            <span>Fecha creada</span>
            <strong>${formatDate(match.createdAt)}</strong>
          </div>
          <div>
            <span>ID de partida</span>
            <strong>${escapeHtml(match.id)}</strong>
          </div>
        </div>
      </header>

      <div class="match-detail-tabs" role="tablist" aria-label="Detalle de partida">
        ${DETAIL_TABS.map(tab => `
          <button
            class="match-detail-tab ${tab.id === currentTab.id ? "is-active" : ""}"
            type="button"
            role="tab"
            aria-selected="${tab.id === currentTab.id}"
            data-detail-tab="${tab.id}"
          >
            ${escapeHtml(tab.label)}
          </button>
        `).join("")}
      </div>

      <div class="match-detail-panel">
        ${currentTab.id === "scoreboard" ? renderScoreboard(match, player, championById) : renderPlaceholderTab(currentTab)}
      </div>
    </section>
  `;
}

export function renderMatchHistory(player, database) {
  const container = document.getElementById("match-history-content");
  const championById = new Map(database.champions.map(champion => [champion.id, champion]));
  const playerMatches = database.matches
    .filter(match => match.playerId === player.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20);
  let selectedMatchId = null;
  let activeDetailTab = "scoreboard";

  if (playerMatches.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No hay partidas registradas.</strong>
        <span>Agrega partidas en data/matches.json para este jugador.</span>
      </div>
    `;
    return;
  }

  const renderSelectedMatch = shouldScroll => {
    const detailsContainer = container.querySelector("[data-match-details-slot]");
    const selectedMatch = playerMatches.find(match => match.id === selectedMatchId);

    if (!detailsContainer) {
      return;
    }

    if (!selectedMatch) {
      detailsContainer.innerHTML = `
        <div class="match-detail-empty">
          <strong>Selecciona una partida</strong>
          <span>Haz click en una partida para abrir el resumen avanzado y sus pestanas.</span>
        </div>
      `;
      return;
    }

    detailsContainer.innerHTML = renderMatchDetail(selectedMatch, player, championById, activeDetailTab);

    container.querySelectorAll(".match-card").forEach(card => {
      card.classList.toggle("is-selected", card.dataset.matchId === selectedMatchId);
    });

    detailsContainer.querySelectorAll("[data-detail-tab]").forEach(button => {
      button.addEventListener("click", () => {
        activeDetailTab = button.dataset.detailTab;
        renderSelectedMatch(false);
      });
    });

    if (shouldScroll) {
      detailsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  container.innerHTML = `
    <div class="match-history-header">
      <span>Historial de partidas</span>
      <strong>${playerMatches.length} recientes</strong>
    </div>

    <div class="match-list">
      ${playerMatches.map(match => {
        const champion = championById.get(match.championId);
        const slots = itemSlots(match.items ?? []);

        return `
          <article class="match-card match-card--${match.result}" data-match-id="${match.id}" role="button" tabindex="0">
            <div class="match-champion">
              <div class="match-champion-icon">
                <img src="./assets/champions/Icons/${champion?.icon}" alt="${champion?.name ?? "Campeon"}" onerror="this.remove()">
                <span>${match.championLevel}</span>
              </div>
              <div>
                <strong>${champion?.name ?? "Campeon"}</strong>
                <small>${match.gameMode}</small>
              </div>
            </div>

            <div class="match-result">
              <strong>${RESULT_LABEL[match.result] ?? match.result}</strong>
              <span>${match.mapName}</span>
            </div>

            <div class="match-spells">
              ${(match.spells ?? []).map(spell => `
                <img src="./assets/spells/${spell}" alt="Hechizo de invocador" onerror="this.remove()">
              `).join("")}
            </div>

            <div class="match-items">
              ${slots.map(item => `
                <div class="match-item-slot">
                  ${item ? `<img src="./assets/items/${item}" alt="Objeto comprado" onerror="this.remove()">` : ""}
                </div>
              `).join("")}
            </div>

            <div class="match-kda">
              <strong>${match.kills} / ${match.deaths} / ${match.assists}</strong>
              <span>KDA</span>
            </div>

            <div class="match-stats">
              <span>${match.minionsKilled} CS</span>
              <span>${match.goldEarned.toLocaleString("es-MX")} oro</span>
            </div>

            <div class="match-meta">
              <span>${formatDuration(match.durationSeconds)}</span>
              <span>${formatDate(match.createdAt)}</span>
            </div>
          </article>
        `;
      }).join("")}
    </div>

    <div class="match-details-slot" data-match-details-slot></div>
  `;

  container.querySelectorAll(".match-card").forEach(card => {
    const selectMatch = () => {
      selectedMatchId = card.dataset.matchId;
      activeDetailTab = "scoreboard";
      renderSelectedMatch(true);
    };

    card.addEventListener("click", selectMatch);
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectMatch();
      }
    });
  });

  renderSelectedMatch(false);
}
