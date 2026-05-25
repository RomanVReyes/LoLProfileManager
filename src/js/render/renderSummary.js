export function renderSummary(summaryData) {
  const {
    player,
    title,
    honor,
    soloDuoRank,
    flexRank,
    mainMasteryChampion,
    topThreeMasteryChampions
  } = summaryData;

  const container = document.getElementById("summary-content");
  const xpPercent = Math.min(100, Math.max(0, (player.currentXp / player.requiredXp) * 100));
  const honorEmblem = honor?.emblem ?? honor?.stages?.at(-1) ?? honor?.unlock;
  const selectedTokens = player.tokens?.slice(0, 3) ?? [];
  const assetPath = (basePath, value) => {
    if (!value) {
      return "";
    }

    const normalizedValue = value.replaceAll("\\", "/");

    if (normalizedValue.startsWith("./") || normalizedValue.startsWith("assets/")) {
      return normalizedValue;
    }

    const assetsIndex = normalizedValue.lastIndexOf("/assets/");

    if (assetsIndex >= 0) {
      return `.${normalizedValue.slice(assetsIndex)}`;
    }

    return `${basePath}/${normalizedValue}`;
  };

  container.innerHTML = `
    <section class="summary-profile-card">
      <div class="summary-banner">
        <img src="${assetPath("./assets/banners", player.banner)}" alt="Estandarte de ${player.summonerName}" onerror="this.remove()">

        <div class="summary-main-info">
          <div class="summary-icon-wrapper">
            <img class="summary-border" src="${assetPath("./assets/borders", player.borderIcon)}" alt="Borde de perfil" onerror="this.remove()">
            <img class="summary-icon" src="${assetPath("./assets/icons", player.icon)}" alt="Icono de ${player.summonerName}" onerror="this.remove()">
          </div>

          <div class="summary-player-info">
            <h2>${player.summonerName} <span>#${player.tag}</span></h2>
            <p>${title?.name ?? "Sin titulo"}</p>

            <div class="summary-level">
              <span>Nivel ${player.level}</span>
              <div class="xp-bar">
                <div class="xp-fill" style="width: ${xpPercent}%"></div>
              </div>
              <small>${player.currentXp} / ${player.requiredXp} XP</small>
            </div>
          </div>
        </div>
      </div>

      <div class="summary-tokens" aria-label="Tokens elegidos">
        ${selectedTokens.map((token, index) => `
          <div class="summary-token" title="Token ${index + 1}">
            <img src="${assetPath(`./assets/tokens/${token.tier}`, token.icon)}" alt="Token ${index + 1} ${token.tier}" onerror="this.remove()">
          </div>
        `).join("")}
      </div>
    </section>

    <section class="summary-grid">
      <article class="summary-card summary-rank-card">
        <h3>Rango</h3>
        <img src="./assets/ranks/${soloDuoRank?.icon}" alt="${soloDuoRank?.name}">
        <strong>${soloDuoRank?.name} ${player.ranked.soloDuo.division}</strong>
        <p>${player.ranked.soloDuo.lp} LP</p>

        <div class="summary-hover-box">
          <p>Solo/Duo: ${soloDuoRank?.name} ${player.ranked.soloDuo.division}</p>
          <p>Flexible: ${flexRank?.name} ${player.ranked.flex.division}</p>
        </div>
      </article>

      <article class="summary-card">
        <h3>Honor</h3>
        <img src="./assets/honor/${honorEmblem}" alt="${honor?.name}">
        <strong>${honor?.name}</strong>
      </article>

      <article class="summary-card summary-mastery-card">
        <h3>Maestria</h3>
        <img src="./assets/champions/Icons/${mainMasteryChampion.champion.icon}" alt="${mainMasteryChampion.champion.name}">
        <strong>${player.masteryScore.toLocaleString("es-MX")} puntos</strong>
        <p>${mainMasteryChampion.champion.name}: ${mainMasteryChampion.points.toLocaleString("es-MX")}</p>

        <div class="summary-hover-box">
          ${topThreeMasteryChampions.map(mastery => `
            <p>${mastery.champion.name}: ${mastery.points.toLocaleString("es-MX")}</p>
          `).join("")}
        </div>
      </article>
    </section>
  `;
}
