import json
from dataclasses import dataclass
from datetime import datetime
from hashlib import md5
from os.path import exists, join
from typing import Dict
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from dataclasses_json import dataclass_json
from PIL import Image
from selenium import webdriver


@dataclass_json
@dataclass
class OpenGraphImage:
    updated: datetime
    path: str
    hash: str
    id: str
    imageFile: str


if __name__ == "__main__":
    # Assumes site is being hosted with Hugo server on default port
    sitemap_url = "http://localhost:1313/sitemap.xml"
    public_dir = join("public")
    og_data_file = join("scripts", "ogData.json")
    og_dir = join("assets", "images", "og")

    driver = webdriver.Chrome()

    # Restore from existing json
    og_data: Dict[str, OpenGraphImage] = {}
    if exists(og_data_file):
        with open(og_data_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        ogs = [OpenGraphImage.from_json(json.dumps(og_d)) for og_d in data.values()]
        og_data = {og.path: og for og in ogs}

    # Use sitemap to find all pages and screenshot their .og.html counterpart if
    # they've changed since last updated
    soup = BeautifulSoup(requests.get(sitemap_url).text, "xml")
    for loc in soup.find_all("loc"):
        url = loc.get_text() + "index.og.html"
        path = urlparse(url).path
        html = requests.get(url).text
        hash = md5(html.encode("utf-8")).hexdigest()

        if path not in og_data or og_data[path].hash != hash:
            print(f'- Changed file "{path}"')

            # Get unique id from the HTML title
            og_soup = BeautifulSoup(html, "html.parser")
            id = og_soup.title.text

            # Screenshot .og.html page
            image_file = f"{id}.png"
            image_path = join(og_dir, image_file)
            driver.get(url)
            driver.save_screenshot(image_path)
            Image.open(image_path).crop((0, 0, 1200, 630)).save(image_path)

            og_data[path] = OpenGraphImage(
                datetime.now(),
                path,
                hash,
                id,
                image_file,
            )

    driver.quit()

    # Save to json
    data = {og.path: json.loads(og.to_json()) for og in og_data.values()}
    with open(og_data_file, "w", encoding="utf-8") as f:
        json.dump(data, f)
