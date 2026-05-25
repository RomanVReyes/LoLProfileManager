export function renderMatchHistory(player, database) {
  const container = document.getElementById("match-history-content");
  const championById = new Map(database.champions.map(champion => [champion.id, champion]));
  const playerMatches = database.matches
    .filter(match => match.playerId === player.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20);

  const formatDuration = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = dateValue => {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(dateValue));
  };

  const resultLabel = {
    win: "Victoria",
    draw: "Empate",
    loss: "Derrota"
  };

  if (playerMatches.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No hay partidas registradas.</strong>
        <span>Agrega partidas en data/matches.json para este jugador.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="match-history-header">
      <span>Historial de partidas</span>
      <strong>${playerMatches.length} recientes</strong>
    </div>

    <div class="match-list">
      ${playerMatches.map(match => {
        const champion = championById.get(match.championId);
        const itemSlots = [...match.items.slice(0, 8), ...Array(Math.max(0, 8 - match.items.length)).fill(null)];

        return `
          <article class="match-card match-card--${match.result}" data-match-id="${match.id}">
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
              <strong>${resultLabel[match.result] ?? match.result}</strong>
              <span>${match.mapName}</span>
            </div>

            <div class="match-spells">
              ${match.spells.map(spell => `
                <img src="./assets/spells/${spell}" alt="Hechizo de invocador" onerror="this.remove()">
              `).join("")}
            </div>

            <div class="match-items">
              ${itemSlots.map(item => `
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
  `;
}
