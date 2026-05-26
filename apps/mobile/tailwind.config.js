/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0A0E17",
        surface: "#12182A",
        accent: "#00D68F",
        muted: "#8B95AD",
      },
    },
  },
  plugins: [],
};
