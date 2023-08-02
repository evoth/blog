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
      screens: {
        "3xl": "1792px",
        "4xl": "2048px",
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
