/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        icon: {
          operational: "#16a34a",
        },
      },
    },
  },
  plugins: [],
};
