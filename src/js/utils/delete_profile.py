import argparse
import json
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[3]
DATA_DIR = ROOT_DIR / "data"


def read_json(path):
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def write_json(path, data):
    with path.open("w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)
        file.write("\n")


def parse_args():
    parser = argparse.ArgumentParser(description="Elimina perfiles y sus partidas por nombre.")
    parser.add_argument("name", help="Nombre del invocador a eliminar.")
    parser.add_argument("--tag", help="Tag opcional. Si no se envia, elimina todos los perfiles con ese nombre.")
    parser.add_argument("--dry-run", action="store_true", help="Muestra que se eliminaria sin modificar archivos.")

    return parser.parse_args()


def matches_profile(player, name, tag=None):
    same_name = player["summonerName"].lower() == name.lower()

    if not same_name:
        return False

    if tag is None:
        return True

    return player["tag"].lower() == tag.lower()


def main():
    args = parse_args()
    players_path = DATA_DIR / "players.json"
    matches_path = DATA_DIR / "matches.json"
    players = read_json(players_path)
    matches = read_json(matches_path)
    profiles_to_delete = [
        player
        for player in players
        if matches_profile(player, args.name, args.tag)
    ]

    if not profiles_to_delete:
        tag_label = f"#{args.tag.upper()}" if args.tag else ""
        raise SystemExit(f"No se encontro ningun perfil para {args.name}{tag_label}.")

    deleted_ids = {player["id"] for player in profiles_to_delete}
    remaining_players = [
        player
        for player in players
        if player["id"] not in deleted_ids
    ]
    remaining_matches = [
        match
        for match in matches
        if match.get("playerId") not in deleted_ids
    ]
    removed_matches = len(matches) - len(remaining_matches)

    print("Perfiles encontrados:")
    for player in profiles_to_delete:
        print(f"- {player['summonerName']}#{player['tag']} (id {player['id']})")

    print(f"Partidas a eliminar: {removed_matches}")

    if args.dry_run:
        print("Dry run activo. No se modificaron archivos.")
        return

    write_json(players_path, remaining_players)
    write_json(matches_path, remaining_matches)

    print("Eliminacion completada.")


if __name__ == "__main__":
    main()
