import json
import re
from dataclasses import dataclass
from datetime import datetime
from os import walk
from os.path import exists, join
from typing import Dict, Optional

import requests
from bs4 import BeautifulSoup
from dataclasses_json import dataclass_json


@dataclass_json
@dataclass
class LinkPreview:
    updated: datetime
    url: str
    title: Optional[str] = None
    domain: Optional[str] = None
    description: Optional[str] = None
    thumbnailName: Optional[str] = None


def process_existing(link_data: Dict[str, LinkPreview], url: str):
    print(f'- Existing url "{url}"')


def process_new(link_data: Dict[str, LinkPreview], url: str):
    print(f'- New url "{url}"')
    r = requests.get(url)
    soup = BeautifulSoup(r.text, "html.parser")
    metas = soup.select("meta[property]")
    meta = {v["property"]: v["content"] for v in metas}
    print(meta)
    title = soup.title.text
    if "og:title" in meta:
        title = meta["og:title"]
    description = None
    if "og:description" in meta:
        description = meta["og:description"]

    domain_regex = re.compile(
        "^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)", re.I
    )
    link_data[url] = LinkPreview(
        datetime.now(),
        url,
        title=title,
        domain=domain_regex.search(url).group(1),
        description=description,
    )


content_dir = "content"
link_data_dir = join("data", "links")
link_data_file = join(link_data_dir, "linkData.json")
link_thumb_dir = join(link_data_dir, "thumbnails")

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

# Old version: "((https:\/\/|http:\/\/)([A-Z]|[a-z]|[0-9]|[-._~:/?#[\]@!$&'()*+,;%=])+)"
# Parentheses in markdown were causing issues
regex = re.compile(
    "((https:\/\/|http:\/\/)([A-Z]|[a-z]|[0-9]|[-._~:/?#[\]@!$&'*+,;%=])+)"
)

# Find all urls in source (content) files and process them
for root, dirs, files in walk(content_dir):
    for file in files:
        if not file.lower().endswith(filetypes):
            continue
        filepath = join(root, file)
        with open(filepath) as f:
            matches = regex.findall(f.read())
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
