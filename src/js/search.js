export function findPlayerByName(players, searchText) {
  const normalizedSearch = searchText.trim().toLowerCase();

  return players.find(player =>
    player.summonerName.toLowerCase() === normalizedSearch ||
    `${player.summonerName}#${player.tag}`.toLowerCase() === normalizedSearch ||
    player.tag.toLowerCase() === normalizedSearch.replace("#", "")
  );
}

export function getPlayerSuggestions(players, searchText) {
  const normalizedSearch = searchText.trim().toLowerCase();

  if (!normalizedSearch) {
    return players;
  }

  return players.filter(player => {
    const name = player.summonerName.toLowerCase();
    const tag = player.tag.toLowerCase();
    const riotId = `${name}#${tag}`;

    return (
      name.includes(normalizedSearch) ||
      tag.includes(normalizedSearch.replace("#", "")) ||
      riotId.includes(normalizedSearch)
    );
  });
}
