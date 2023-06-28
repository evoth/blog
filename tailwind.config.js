const defaultTheme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./layouts/**/*.{html,js}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        zinc: {
          930: "#141414",
        },
      },
      fontFamily: {
        rubik: ['"Rubik"', ...defaultTheme.fontFamily.sans],
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
