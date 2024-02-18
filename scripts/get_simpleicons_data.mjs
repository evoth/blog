import {
  getIconsData,
  titleToSlug,
} from "../node_modules/simple-icons/sdk.mjs";

import Color from "colorjs.io";
import chroma from "chroma-js";
import fs from "fs";

const colors = [
  ["black", "#000000"],
  ["blue", "#0000FF"],
  ["dark blue", "#000055"],
  ["light blue", "#8cbeff"],
  ["blue", "#00a6ff"],
  ["sky blue", "#6bcbff"],
  ["dark blue", "#004163"],
  ["cyan", "#00FFFF"],
  ["light cyan", "#96ffff"],
  ["green", "#008000"],
  ["green", "#69ff69"],
  ["bright green", "#00ff00"],
  ["light green", "#8cff8c"],
  ["light green", "#004500"],
  ["teal", "#008080"],
  ["turquoise", "#40E0D0"],
  ["bright aquamarine", "#00ffae"],
  ["aquamarine", "#4cd4a9"],
  ["dark purple", "#320057"],
  ["gray", "#808080"],
  ["indigo", "#9300ff"],
  ["dark magenta", "#590059"],
  ["red", "#A52A2A"],
  ["tan", "#D2B48C"],
  ["light magenta", "#EE82EE"],
  ["pink", "#ff6ec5"],
  ["light pink", "#ffabdd"],
  ["light purple", "#faafef"],
  ["beige", "#d4b9a1"],
  ["hot pink", "#ff00c8"],
  ["gold", "#FFD700"],
  ["gold", "#a19118"],
  ["light yellow", "#ffe973"],
  ["magenta", "#FF00FF"],
  ["orange", "#FFA500"],
  ["bright orange", "#ff5e00"],
  ["light orange", "#ff9b61"],
  ["light orange", "#ffac69"],
  ["brown", "#613f00"],
  ["brown", "#693713"],
  ["dark brown", "#361600"],
  ["pink", "#f7a6b4"],
  ["bright red", "#FF0000"],
  ["dark red", "#5c0000"],
  ["red", "#ad0707"],
  ["light red", "#e86f6f"],
  ["white", "#FFFFFF"],
  ["bright yellow", "#FFFF00"],
  ["light yellow", "#ffff8c"],
  ["purple", "#bb00ff"],
  ["dark purple", "#470061"],
  ["lime", "#bfff52"],
  ["bright lime", "#bbff00"],
  ["dark lime", "#6b9100"],
];

const getColorName = (hex) => {
  let minDeltaE;
  let minName;
  for (const [name, colorHex] of colors) {
    const deltaE = chroma.deltaE(hex, chroma(colorHex));
    if (minDeltaE === undefined || deltaE < minDeltaE) {
      minDeltaE = deltaE;
      minName = name;
    }
  }
  return minName;
};

const iconsData = await getIconsData();

const fgLightHex = "fafafa";
const fgDarkHex = "18181b";
const fgLight = new Color("#" + fgLightHex);
const fgDark = new Color("#" + fgDarkHex);

const data = {};
for (const icon of iconsData) {
  let bg = new Color("#" + icon.hex);
  let fgHex =
    Math.abs(bg.contrast(fgLight, "APCA")) > 20 ? fgLightHex : fgDarkHex;
  const slug = titleToSlug(icon.title);
  data[slug] = {
    title: icon.title,
    slug,
    bgHex: icon.hex,
    fgHex,
    bgName: getColorName(icon.hex),
    fgName: getColorName(fgHex),
  };
}

fs.writeFileSync(process.argv[2], JSON.stringify(data));
