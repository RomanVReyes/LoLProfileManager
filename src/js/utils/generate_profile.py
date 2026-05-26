import argparse
import json
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[3]
DATA_DIR = ROOT_DIR / "data"
ASSETS_DIR = ROOT_DIR / "assets"

REGIONS = {
    "LAN": "Latinoamerica Norte",
    "LAS": "Latinoamerica Sur",
    "NA": "Norteamerica",
    "EUW": "Europa Oeste"
}

DIVISIONS = ["IV", "III", "II", "I"]
GAME_MODES = [
    "Clasificatoria Solo/Duo",
    "Clasificatoria Flexible",
    "Normal Alternada",
    "Normal Reclutamiento",
    "ARAM"
]
MAP_BY_MODE = {
    "ARAM": "Abismo de los Lamentos"
}
PLAYER_NAMES = [
    "Solar Warden",
    "River Blade",
    "Midnight Arc",
    "Nexus Bloom",
    "Iron Aegis",
    "Crimson Wave",
    "Blue Sentinel",
    "Golden Mark",
    "Void Signal",
    "Lane Oracle",
    "Arcane Pulse",
    "Silent Baron",
    "Hextech Nova",
    "Lane Mirage",
    "Rift Echo"
]
ROLES = ["Top", "Jungla", "Mid", "ADC", "Support"]


def read_json(path):
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def write_json(path, data):
    with path.open("w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)
        file.write("\n")


def list_asset_names(*parts, suffixes=None):
    folder = ASSETS_DIR.joinpath(*parts)
    if not folder.exists():
        return []

    files = [file.name for file in folder.iterdir() if file.is_file()]

    if suffixes:
        files = [name for name in files if name.lower().endswith(suffixes)]

    return sorted(files)


def list_rune_paths():
    rune_files = []

    for file in (ASSETS_DIR / "runes").rglob("*.png"):
        rune_files.append(file.relative_to(ASSETS_DIR / "runes").as_posix())

    return sorted(rune_files)


def random_honor(honor_rows):
    honor = random.choice(honor_rows)
    selected = dict(honor)

    if "stages" in selected:
        selected["emblem"] = random.choice(selected["stages"])
    elif "unlock" in selected:
        selected["emblem"] = selected["unlock"]

    return selected


def random_rank(ranks):
    rank = random.choice(ranks)

    if rank["id"] == "unranked":
        return {
            "tier": "unranked",
            "division": "",
            "lp": 0,
            "wins": 0,
            "losses": 0
        }

    return {
        "tier": rank["id"],
        "division": random.choice(DIVISIONS),
        "lp": random.randint(0, 99),
        "wins": random.randint(18, 130),
        "losses": random.randint(12, 120)
    }


def random_tokens():
    token_tiers = [
        folder.name
        for folder in (ASSETS_DIR / "tokens").iterdir()
        if folder.is_dir()
    ]
    selected_tiers = random.sample(token_tiers, k=min(3, len(token_tiers)))
    tokens = []

    for tier in selected_tiers:
        token_icons = list_asset_names("tokens", tier, suffixes=(".png",))
        if token_icons:
            tokens.append({"tier": tier, "icon": random.choice(token_icons)})

    return tokens


def champion_for_role(champions, role, fallback_ids=None):
    candidates = [champion for champion in champions if champion.get("role") == role]

    if fallback_ids:
        candidates = [
            champion
            for champion in candidates
            if champion["id"] not in fallback_ids
        ] or candidates

    return random.choice(candidates or champions)


def random_spells(role, mode, spells):
    if mode == "ARAM":
        secondary = random.choice(["Heal_HD.png", "Exhaust_HD.png", "Barrier_HD.png", "Ghost_HD.png"])
        return ["Flash_HD.png", secondary]

    if role == "Jungla":
        return ["Flash_HD.png", "Smite_HD.png"]

    if role == "Top":
        return ["Flash_HD.png", random.choice(["Teleport_HD.png", "Ghost_HD.png", "Ignite_HD.png"])]

    if role == "ADC":
        return ["Flash_HD.png", random.choice(["Heal_HD.png", "Barrier_HD.png", "Cleanse_HD.png"])]

    if role == "Support":
        return ["Flash_HD.png", random.choice(["Heal_HD.png", "Exhaust_HD.png", "Ignite_HD.png"])]

    available = [spell for spell in spells if spell != "Flash_HD.png"]
    return ["Flash_HD.png", random.choice(available)]


def random_items(items, count=None):
    if not items:
        return []

    count = count or random.randint(4, 8)
    return random.sample(items, k=min(count, len(items)))


def random_participant(name, role, champion, mode, spells, items, runes, result_bias=0):
    deaths = random.randint(1, 10)
    kills = max(0, random.randint(0, 14) + result_bias)
    assists = max(1, random.randint(2, 24) + result_bias * 2)
    is_support = role == "Support"
    is_jungle = role == "Jungla"

    return {
        "summonerName": name,
        "championId": champion["id"],
        "championLevel": random.randint(11, 18),
        "mainRune": random.choice(runes),
        "spells": random_spells(role, mode, spells),
        "items": random_items(items),
        "kills": kills,
        "deaths": deaths,
        "assists": assists,
        "minionsKilled": random.randint(24, 72) if is_support or is_jungle else random.randint(145, 285),
        "goldEarned": random.randint(7800, 17800)
    }


def team_totals(players):
    return {
        "kills": sum(player["kills"] for player in players),
        "deaths": sum(player["deaths"] for player in players),
        "assists": sum(player["assists"] for player in players),
        "goldEarned": sum(player["goldEarned"] for player in players)
    }


def random_objectives(result):
    winning = result == "win"

    return {
        "torres": random.randint(6, 11) if winning else random.randint(1, 7),
        "dragones": random.randint(2, 4) if winning else random.randint(0, 2),
        "baron": random.randint(0, 2) if winning else random.randint(0, 1),
        "herald": random.randint(0, 2),
        "inhibidores": random.randint(1, 3) if winning else random.randint(0, 1)
    }


def opposite_result(result):
    if result == "win":
        return "loss"
    if result == "loss":
        return "win"
    return "draw"


def build_match(match_index, player, champions, spells, items, runes):
    mode = random.choice(GAME_MODES)
    result = random.choices(["win", "loss", "draw"], weights=[48, 44, 8], k=1)[0]
    map_name = MAP_BY_MODE.get(mode, "Grieta del Invocador")
    duration = random.randint(900, 2350) if mode == "ARAM" else random.randint(1350, 2450)
    created_at = datetime.now(timezone.utc) - timedelta(hours=match_index * random.randint(2, 7))
    match_id = f"{player['tag']}-P{player['id']:03d}-{created_at.strftime('%Y%m%d')}-{match_index + 1:03d}"
    player_role = random.choice(ROLES)
    player_champion = champion_for_role(champions, player_role)
    used_champion_ids = {player_champion["id"]}

    team_one_players = []

    for role in ROLES:
        if role == player_role:
            participant = random_participant(
                f"{player['summonerName']}#{player['tag']}",
                role,
                player_champion,
                mode,
                spells,
                items,
                runes,
                result_bias=2 if result == "win" else 0
            )
        else:
            champion = champion_for_role(champions, role, used_champion_ids)
            used_champion_ids.add(champion["id"])
            participant = random_participant(
                random.choice(PLAYER_NAMES),
                role,
                champion,
                mode,
                spells,
                items,
                runes,
                result_bias=1 if result == "win" else 0
            )

        team_one_players.append(participant)

    team_two_players = []

    for role in ROLES:
        champion = champion_for_role(champions, role, used_champion_ids)
        used_champion_ids.add(champion["id"])
        team_two_players.append(random_participant(
            random.choice(PLAYER_NAMES),
            role,
            champion,
            mode,
            spells,
            items,
            runes,
            result_bias=1 if result == "loss" else 0
        ))

    team_one_result = result
    team_two_result = opposite_result(result)
    team_one = {
        "name": "Equipo 1",
        "result": team_one_result,
        "bans": random.sample([champion["id"] for champion in champions], k=min(5, len(champions))),
        "objectives": random_objectives(team_one_result),
        "players": team_one_players,
        **team_totals(team_one_players)
    }
    team_two = {
        "name": "Equipo 2",
        "result": team_two_result,
        "bans": random.sample([champion["id"] for champion in champions], k=min(5, len(champions))),
        "objectives": random_objectives(team_two_result),
        "players": team_two_players,
        **team_totals(team_two_players)
    }
    focused_player = next(
        participant
        for participant in team_one_players
        if participant["summonerName"] == f"{player['summonerName']}#{player['tag']}"
    )

    return {
        "id": match_id,
        "playerId": player["id"],
        "createdAt": created_at.isoformat(),
        "result": result,
        "gameMode": mode,
        "mapName": map_name,
        "durationSeconds": duration,
        "championId": focused_player["championId"],
        "championLevel": focused_player["championLevel"],
        "spells": focused_player["spells"],
        "items": focused_player["items"],
        "kills": focused_player["kills"],
        "deaths": focused_player["deaths"],
        "assists": focused_player["assists"],
        "minionsKilled": focused_player["minionsKilled"],
        "goldEarned": focused_player["goldEarned"],
        "teams": [team_one, team_two]
    }


def build_player(args, players, champions, titles, ranks, honor_rows):
    new_id = max([player["id"] for player in players], default=0) + 1
    level = random.randint(30, 500)
    mastery_champions = random.sample(champions, k=min(3, len(champions)))
    mastery_points = sorted(
        [random.randint(45000, 320000) for _ in mastery_champions],
        reverse=True
    )

    return {
        "id": new_id,
        "summonerName": args.name,
        "tag": args.tag.upper(),
        "region": REGIONS.get(args.tag.upper(), "Latinoamerica Norte"),
        "titleId": random.choice(titles)["id"],
        "level": level,
        "currentXp": random.randint(0, 2499),
        "requiredXp": 2500,
        "banner": random.choice(list_asset_names("banners", suffixes=(".png", ".jpg", ".jpeg", ".webp"))),
        "icon": random.choice(list_asset_names("icons", suffixes=(".png", ".jpg", ".jpeg", ".webp"))),
        "borderIcon": random.choice(list_asset_names("borders", suffixes=(".png",))),
        "honor": random_honor(honor_rows),
        "masteryScore": random.randint(90000, 980000),
        "tokens": random_tokens(),
        "ranked": {
            "soloDuo": random_rank(ranks),
            "flex": random_rank(ranks)
        },
        "championMastery": [
            {
                "championId": champion["id"],
                "points": mastery_points[index],
                "level": random.randint(5, 7)
            }
            for index, champion in enumerate(mastery_champions)
        ]
    }


def parse_args():
    parser = argparse.ArgumentParser(description="Genera un perfil y sus partidas de prueba.")
    parser.add_argument("name", help="Nombre del invocador a crear.")
    parser.add_argument("--tag", default="LAN", help="Tag del invocador. Default: LAN.")
    parser.add_argument("--matches", type=int, default=20, help="Cantidad de partidas a generar. Default: 20.")
    parser.add_argument("--seed", type=int, help="Semilla opcional para generar datos repetibles.")

    return parser.parse_args()


def main():
    args = parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    players = read_json(DATA_DIR / "players.json")
    matches = read_json(DATA_DIR / "matches.json")
    champions = read_json(DATA_DIR / "champions.json")
    titles = read_json(DATA_DIR / "titles.json")
    ranks = read_json(DATA_DIR / "ranks.json")
    honor_rows = read_json(DATA_DIR / "honor.json")
    spells = list_asset_names("spells", suffixes=(".png", ".jpg", ".jpeg", ".webp"))
    items = list_asset_names("items", suffixes=(".png", ".jpg", ".jpeg", ".webp"))
    runes = list_rune_paths()

    if any(
        player["summonerName"].lower() == args.name.lower() and player["tag"].lower() == args.tag.lower()
        for player in players
    ):
        raise SystemExit(f"Ya existe un perfil para {args.name}#{args.tag.upper()}.")

    player = build_player(args, players, champions, titles, ranks, honor_rows)
    generated_matches = [
        build_match(index, player, champions, spells, items, runes)
        for index in range(max(0, args.matches))
    ]

    players.append(player)
    matches.extend(generated_matches)

    write_json(DATA_DIR / "players.json", players)
    write_json(DATA_DIR / "matches.json", matches)

    print(f"Perfil creado: {player['summonerName']}#{player['tag']} (id {player['id']})")
    print(f"Partidas generadas: {len(generated_matches)}")


if __name__ == "__main__":
    main()
