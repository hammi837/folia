/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        folia: {
          cream: "#F7F3EE",
          sand: "#E8DFD4",
          ink: "#1C1917",
          moss: "#3F5D4A",
          blush: "#D4A5A5",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        body: ['"Satoshi"', '"DM Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
