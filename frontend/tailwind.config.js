/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        folia: {
          cream: "#F4EFE6",
          sand: "#DDD2C4",
          ink: "#1A1F1C",
          moss: "#2F4A3A",
          leaf: "#5A7A62",
          blush: "#C9A090",
          mist: "#E8F0EB",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        body: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      maxWidth: {
        site: "72rem",
      },
      boxShadow: {
        soft: "0 18px 50px -28px rgba(26, 31, 28, 0.35)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.7s ease-out both",
      },
    },
  },
  plugins: [],
};
