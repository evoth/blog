import json
import re
from os import walk
from os.path import basename, exists, join

import requests
import yaml

if __name__ == "__main__":
    REFRESH = False

    content_dir = join("content")
    icon_data_file = join("data", "iconData.json")
    icon_dir = join("assets", "images", "icons")
    svg_template_path = join("scripts", "icon_template.svg")

    with open(icon_data_file, "r", encoding="utf-8") as f:
        icon_data = json.load(f)

    filetypes = ("md",)
    front_matter_regex = r"^---\n(.*?)\n---"

    # Find all front matter in source (content) files and process them
    for root, dirs, files in walk(content_dir):
        for file in files:
            if not file.lower().endswith(filetypes):
                continue
            filepath = join(root, file)

            with open(filepath) as f:
                md_contents = f.read()

            yaml_match = re.search(front_matter_regex, md_contents, re.DOTALL)
            if yaml_match is None:
                continue
            front_matter = yaml.load(yaml_match.group(1), yaml.Loader)
            if "simpleIcon" not in front_matter and "iconPath" not in front_matter:
                continue

            print(f"Processing {filepath}")

            if "simpleIcon" in front_matter:
                icon_slug = front_matter["simpleIcon"]
                icon_title = icon_data[icon_slug]["title"]
                icon_bg_hex = icon_data[icon_slug]["bgHex"].lower()
                icon_fg_hex = icon_data[icon_slug]["fgHex"].lower()
                icon_path = join(icon_dir, f"{icon_slug}.svg")
                icon_alt = f"{icon_title} logo in {icon_data[icon_slug]['fgName']} on a {icon_data[icon_slug]['bgName']} background."

                if not exists(icon_path) or REFRESH:
                    print(f"- Downloading {icon_title} icon")
                    # See https://www.npmjs.com/package/simple-icons#cdn-with-colors
                    response = requests.get(
                        f"https://cdn.simpleicons.org/{icon_slug}/{icon_fg_hex}"
                    )
                    with open(icon_path, "wb") as f:
                        f.write(response.content)
            elif "iconPath" in front_matter:
                icon_bg_hex = "18181b"
                icon_fg_hex = "fafafa"
                icon_path = join(root, front_matter["iconPath"])
                # Todo: dynamically pass in color names in case we want to change colors in future
                icon_alt = front_matter["iconAlt"]

            svg_file = f"{basename(root)}-thumb.svg"
            svg_path = join(root, svg_file)

            if not exists(svg_path) or REFRESH:
                print(f"- Creating new svg thumbnail")
                svg_regex = r"^<svg.*?>(.*)<\/svg>$"
                with open(icon_path) as f:
                    svg_match = re.search(svg_regex, f.read(), re.DOTALL)
                icon_svg = svg_match.group(1)

                with open(svg_template_path, "r") as f:
                    template_svg = f.read()

                with open(svg_path, "w") as f:
                    f.write(
                        template_svg.replace("ICON_BG_HEX", icon_bg_hex)
                        .replace("ICON_FG_HEX", icon_fg_hex)
                        .replace("ICON_SVG", icon_svg)
                    )

                print("- Updating front matter")
                front_matter["resources"] = [
                    {
                        "name": "thumb",
                        "src": svg_file,
                        "params": {"alt": icon_alt},
                    }
                ]

                with open(filepath, "w") as f:
                    f.write(
                        md_contents.replace(
                            yaml_match.group(1), yaml.dump(front_matter).strip()
                        )
                    )
