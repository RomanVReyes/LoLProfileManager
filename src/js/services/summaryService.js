export function buildSummaryData(player, database) {
  const title = database.titles.find(title => title.id === player.titleId);

  const honorLevel = player.honorLevel ?? player.honor?.level;
  const honor = database.honor.find(honor => honor.level === honorLevel) ?? player.honor;

  const soloDuoRank = database.ranks.find(
    rank => rank.id === player.ranked.soloDuo.tier
  );

  const flexRank = database.ranks.find(
    rank => rank.id === player.ranked.flex.tier
  );

  const masteryChampions = player.championMastery
    .map(mastery => {
      const champion = database.champions.find(
        champion => champion.id === mastery.championId
      );

      return {
        ...mastery,
        champion
      };
    })
    .sort((a, b) => b.points - a.points);

  const mainMasteryChampion = masteryChampions[0];
  const topThreeMasteryChampions = masteryChampions.slice(0, 3);

  return {
    player,
    title,
    honor,
    soloDuoRank,
    flexRank,
    mainMasteryChampion,
    topThreeMasteryChampions
  };
}
