export async function loadJSON(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`No se pudo cargar: ${path}`);
  }

  return await response.json();
}

export async function loadDatabase() {
  const [
    players,
    champions,
    ranks,
    honor,
    titles,
    matches
  ] = await Promise.all([
    loadJSON("./data/players.json"),
    loadJSON("./data/champions.json"),
    loadJSON("./data/ranks.json"),
    loadJSON("./data/honor.json"),
    loadJSON("./data/titles.json"),
    loadJSON("./data/matches.json")
  ]);

  return {
    players,
    champions,
    ranks,
    honor,
    titles,
    matches
  };
}
