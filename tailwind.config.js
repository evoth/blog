const defaultTheme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./layouts/**/*.{html,js}",
    "./static/**/*.js",
    "./public/**/*.{html,js}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        rubik: ['"Rubik"', ...defaultTheme.fontFamily.sans],
      },
      maxWidth: {
        "2xs": "16rem",
      },
      screens: {
        "3xl": "1792px",
        "4xl": "2048px",
      },
      colors: {
        zinc: {
          350: "#bbbbc1",
        },
      },
      aspectRatio: {
        "3/2": "3 / 2",
        og: "1200 / 630",
      },
    },
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        html: { fontSize: "20px" },
      });
    }),
    require("@tailwindcss/typography"),
  ],
};
