import json
import mimetypes
import re
from dataclasses import dataclass
from datetime import datetime
from os import walk
from os.path import exists, join, splitext
from typing import Dict, Optional
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from dataclasses_json import dataclass_json

# Extension: ^(?:[^?]*\/)(?:[^/:?]+)(\.[^/:?]+)(?:\?.*)?$
# Domain: ^(?:https?:\/\/)?(?:www\.)?([^:\/?]+)
# Slug: ^(?:https?:\/\/)?(?:www\.)?([^:?]+)


@dataclass_json
@dataclass
class LinkPreview:
    updated: datetime
    url: str
    title: Optional[str] = None
    domain: Optional[str] = None
    description: Optional[str] = None
    thumbnail_file: Optional[str] = None
    thumbnail_url: Optional[str] = None
    site_name: Optional[str] = None


def process_existing(link_data: Dict[str, LinkPreview], url: str):
    print(f'- Existing url "{url}"')


def process_new(link_data: Dict[str, LinkPreview], url: str):
    print(f'- New url "{url}"')
    # Get meta tags with the property attribute
    r = requests.get(url)
    soup = BeautifulSoup(r.text, "html.parser")
    metas = soup.select("meta[property]")
    meta = {v["property"]: v["content"] for v in metas}

    print(meta)
    # Extract metadata
    # TODO: Add twitter fallbacks? May not be necessary
    title = meta["og:title"] if "og:title" in meta else soup.title.text
    description = meta["og:description"] if "og:description" in meta else None
    site_name = meta["og:site_name"] if "og:site_name" in meta else None
    domain = urlparse(url).hostname.removeprefix("www.")

    # Download image
    thumbnail_file = None
    thumbnail_url = None
    if "og:image" in meta:
        thumbnail_url = meta["og:image"]
        image_url_path = "".join(urlparse(thumbnail_url)[1:3])
        image_name, _ = splitext(image_url_path)

        response = requests.get(thumbnail_url)
        image_data = response.content
        content_type = response.headers["content-type"]
        image_ext = mimetypes.guess_extension(content_type, strict=False) or ""

        thumbnail_file = (
            re.sub(r'[<>:"/\\|?*]', " ", image_name).strip(". ") + image_ext
        )

        with open(join(link_thumb_dir, thumbnail_file), "wb") as f:
            f.write(image_data)

    link_data[url] = LinkPreview(
        datetime.now(),
        url,
        title=title,
        domain=domain,
        description=description,
        thumbnail_file=thumbnail_file,
        thumbnail_url=thumbnail_url,
        site_name=site_name,
    )


content_dir = "content"
link_data_dir = join("data", "links")
link_data_file = join(link_data_dir, "linkData.json")
link_thumb_dir = join("static", "linkThumbnails")

filetypes = ("md",)

# Restore from existing json
link_data: Dict[str, LinkPreview] = {}
if exists(link_data_file):
    with open(link_data_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    previews = [
        LinkPreview.from_json(json.dumps(preview_d)) for preview_d in data.values()
    ]
    link_data = {preview.url: preview for preview in previews}


url_regex = re.compile("((https?:\/\/)([A-Z]|[a-z]|[0-9]|[-._~:/?#[\]@!$&'*+,;%=])+)")

# Find all urls in source (content) files and process them
for root, dirs, files in walk(content_dir):
    for file in files:
        if not file.lower().endswith(filetypes):
            continue
        filepath = join(root, file)
        with open(filepath) as f:
            matches = url_regex.findall(f.read())
        if len(matches):
            print(f"Found in {filepath}")
        for url, *_ in matches:
            if url in link_data:
                process_existing(link_data, url)
            else:
                process_new(link_data, url)

# Save to json
data = {preview.url: json.loads(preview.to_json()) for preview in link_data.values()}
with open(link_data_file, "w", encoding="utf-8") as f:
    json.dump(data, f)