import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

BASE_URL = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/"
OUTPUT_DIR = "styles"

visited = set()

def is_inside_base(url):
    return url.startswith(BASE_URL)

def download_folder(url):
    if url in visited:
        return

    if not is_inside_base(url):
        return

    visited.add(url)

    relative_path = url.replace(BASE_URL, "").strip("/")
    local_path = os.path.join(OUTPUT_DIR, relative_path)

    os.makedirs(local_path, exist_ok=True)

    print(f"\nExplorando: {url}")

    response = requests.get(url)

    if response.status_code != 200:
        print(f"Error entrando a {url}")
        return

    soup = BeautifulSoup(response.text, "html.parser")

    for link in soup.find_all("a"):
        href = link.get("href")

        if not href:
            continue

        if href.startswith("../") or href.startswith("/"):
            continue

        full_url = urljoin(url, href)

        if not is_inside_base(full_url):
            continue

        if href.endswith("/"):
            download_folder(full_url)

        elif href.lower().endswith(".png"):
            relative_file = full_url.replace(BASE_URL, "")
            file_path = os.path.join(OUTPUT_DIR, relative_file)

            os.makedirs(os.path.dirname(file_path), exist_ok=True)

            if os.path.exists(file_path):
                print(f"Ya existe: {file_path}")
                continue

            print(f"Descargando: {file_path}")

            img_response = requests.get(full_url)

            if img_response.status_code == 200:
                with open(file_path, "wb") as f:
                    f.write(img_response.content)

print("Iniciando descarga...\n")

download_folder(BASE_URL)

print("\nDescarga completada.")